
import express from 'express';
import _ from 'lodash';
import { getSavingsGoalsByUser, createSavingsGoal, getSavingsGoalById, updateSavingsGoalById, deleteSavingsGoalById } from '../db/savings.ts';


// Create a new savings goal for the authenticated user
export const addSavingsGoal = async (req : express.Request, res : express.Response) => {
    try {
        const currentUserId = _.get(req, 'identity._id') as unknown as string;
        if (!currentUserId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { goalName, targetAmount, targetDate, notes } = req.body;

        if (!goalName || !targetAmount || !targetDate) {
            return res.status(400).json({ error: 'goalName, targetAmount, and targetDate are required' });
        }

        if (isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
            return res.status(400).json({ error: "targetAmount must be a positive number" });
        }   

        const savingsGoal = await createSavingsGoal({
            userId: currentUserId,
            goalName: goalName.trim(),
            targetAmount,
            targetDate: new Date(targetDate),
            notes: notes ? notes.trim() : '',
        });

        return res.status(200).json({
            message: "Savings goal created successfully",
            savingsGoal: {  
                userId: savingsGoal.userId,
                goalName: savingsGoal.goalName,
                targetAmount: savingsGoal.targetAmount,
                targetDate: savingsGoal.targetDate,
                notes: savingsGoal.notes,
                currentAmount: savingsGoal.currentAmount,
            }      
        }).end();

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Creating Savings Goal Failed!!' });
    }
};

// List savings goals for the authenticated user with optional filters
export const listSavingsGoals = async (req : express.Request, res : express.Response) => {
    try {
        const currentUserId = _.get(req, 'identity._id') as unknown as string;
        if (!currentUserId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { startDate, endDate, sort } = req.query;

        const options: any = {};

        if (startDate) {
            options.startDate = new Date(startDate as string);
        }

        if (endDate) {
            options.endDate = new Date(endDate as string);
        }

        if (sort) {
            options.sort = sort; // format should be {"targetDate":-1} no space
        }

        const savingsGoals = await getSavingsGoalsByUser(currentUserId, options);

        return res.status(200).json({
            message: "Savings goals retrieved successfully",
            savingsGoals,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Retrieving Savings Goals Failed!!' });
    }
}


// Get a single savings goal by ID for the authenticated user
export const listSavingsGoalById = async (req : express.Request, res : express.Response) => {
    try {
        const currentUserId = _.get(req, 'identity._id') as unknown as string;
        if (!currentUserId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { goalId } = req.params;

        if (!goalId) {
            return res.status(400).json({ error: 'Savings Goal ID is required' });
        }

        const savingsGoal = await getSavingsGoalById(goalId);

        if(!savingsGoal) {
            return res.status(404).json({ error: 'Savings Goal not found' });
        }

        if (savingsGoal.userId.toString() !== currentUserId.toString()) {
            return res.status(403).json({ error: 'Access denied: You can only view your own savings goals' });
        }

        return res.status(200).json({
            message: "Savings goal retrieved successfully",
            savingsGoal,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Retrieving Savings Goal Failed!!' });
    }
}
// Update a savings goal by ID for the authenticated user
export const updateSavingsGoal = async (req : express.Request, res : express.Response) => { 
    try {
        const currentUserId = _.get(req, 'identity._id') as unknown as string;
        if (!currentUserId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { goalId } = req.params;

        if (!goalId) {
            return res.status(400).json({ error: 'Savings Goal ID is required' });
        }

        const savingsGoal = await getSavingsGoalById(goalId);

        if(!savingsGoal) {
            return res.status(404).json({ error: 'Savings Goal not found' });
        }

        if (savingsGoal.userId.toString() !== currentUserId.toString()) {
            return res.status(403).json({ error: 'Access denied: You can only update your own savings goals' });
        }

        const { goalName, targetAmount, targetDate, notes } = req.body;

        const updatedValues: Record<string, any> = {};

        if (goalName) {
            updatedValues.goalName = goalName.trim();
        }

        if (targetAmount) {
            if (isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
                return res.status(400).json({ error: "targetAmount must be a positive number" });
            }   
            updatedValues.targetAmount = targetAmount;
        }

        if (targetDate) {
            updatedValues.targetDate = new Date(targetDate);
        }

        if (notes) {
            updatedValues.notes = notes.trim();
        }

        const updatedSavingsGoal = await updateSavingsGoalById(goalId, updatedValues);

        return res.status(200).json({
            message: "Savings goal updated successfully",
            savingsGoal: updatedSavingsGoal,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Updating Savings Goal Failed!!' });
    }   
};


// Delete a savings goal by ID for the authenticated user
export const deleteSavingsGoal = async (req : express.Request, res : express.Response) => { 
    try {
        const currentUserId = _.get(req, 'identity._id') as unknown as string;
        if (!currentUserId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { goalId } = req.params;

        if (!goalId) {
            return res.status(400).json({ error: 'Savings Goal ID is required' });
        }

        const savingsGoal = await getSavingsGoalById(goalId);

        if(!savingsGoal) {
            return res.status(404).json({ error: 'Savings Goal not found' });
        }

        if (savingsGoal.userId.toString() !== currentUserId.toString()) {
            return res.status(403).json({ error: 'Access denied: You can only delete your own savings goals' });
        }

        await deleteSavingsGoalById(goalId);

        return res.status(200).json({
            message: "Savings goal deleted successfully",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Deleting Savings Goal Failed!!' });
    }   
};

/**
 * Progress tracking for savings goals
 * Track progress by comparing current saved amount vs target amount
 * Users must be able to to add savings contributions to a goal
 * Each contribution must update the goal’s progress
 */