import cron from 'node-cron';
import { getRecurringExpensesDueForGeneration, updateRecurringExpenseById } from '../db/recurringExpenses.ts';
import { createExpense } from '../db/expenses.ts';

/**
 * Calculate the next occurrence date based on frequency
 */
const getNextOccurrence = (lastDate: Date, frequency: string): Date => {
  const next = new Date(lastDate);
  
  switch (frequency) {
    case 'minutely':
      next.setMinutes(next.getMinutes() + 1);
      break;
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
  }
  
  return next;
};

/**
 * Check if an expense should be generated for this recurring entry
 */
const shouldGenerateExpense = (recurring: any, now: Date): boolean => {
    
  if (!recurring.lastGenerated) {
    const shouldGen = now >= new Date(recurring.startDate);
    console.log(`[Recurring Expenses] ${recurring.name}: No lastGenerated, checking startDate. Should generate: ${shouldGen}`);
    return shouldGen;
  }
  
  const lastGen = new Date(recurring.lastGenerated);
  const nextDue = getNextOccurrence(lastGen, recurring.frequency);
  
  console.log(`[Recurring Expenses] ${recurring.name}:`);
  console.log(`  - Last generated: ${lastGen.toISOString()}`);
  console.log(`  - Next due: ${nextDue.toISOString()}`);
  console.log(`  - Current time: ${now.toISOString()}`);
  console.log(`  - Should generate: ${now >= nextDue}`);
  
  return now >= nextDue;
};

/**
 * Generate all due expenses from recurring entries
 */
export const generateRecurringExpenses = async () => {
  try {
    console.log('[Recurring Expenses] Running scheduled check...');
    
    const recurringExpenses = await getRecurringExpensesDueForGeneration();
    const now = new Date();
    let generatedCount = 0;
    
    console.log(`[Recurring Expenses] Found ${recurringExpenses.length} active recurring expense(s)`);
    
    for (const recurring of recurringExpenses) {
      try {
        if (shouldGenerateExpense(recurring, now)) {

          await createExpense({
            userId: recurring.userId,
            amount: recurring.amount,
            name: recurring.name,
            category: recurring.category,
            notes: recurring.notes || `Auto-generated from recurring expense (${recurring.frequency})`,
            date: now,
          });
          
          await updateRecurringExpenseById(recurring._id.toString(), {
            lastGenerated: now,
          });
          
          generatedCount++;
          console.log(`[Recurring Expenses] Generated expense: ${recurring.name} (₱${recurring.amount})`);
        }
      } catch (error) {
        console.error(`[Recurring Expenses] Error generating expense for ${recurring.name}:`, error);
      }
    }
    
    if (generatedCount > 0) {
      console.log(`[Recurring Expenses] Generated ${generatedCount} expense(s)`);
    } else {
      console.log('[Recurring Expenses] No expenses to generate');
    }
    
  } catch (error) {
    console.error('[Recurring Expenses] Error in scheduled task:', error);
  }
};

/**
 * Initialize the cron scheduler
 * Runs every hour at the start of the hour
 */
export const startRecurringExpenseScheduler = () => {
  // Run every hour: '0 * * * *'
  // For testing, you can use '* * * * *' to run every minute
  const cronSchedule = '* * * * *'; // Every minute
  
  console.log('[Recurring Expenses] Starting scheduler...');
  console.log(`[Recurring Expenses] Schedule: ${cronSchedule}`);
  
  cron.schedule(cronSchedule, async () => {
    await generateRecurringExpenses();
  });
  
  // Run immediately on startup to catch any missed expenses
  setTimeout(() => {
    console.log('[Recurring Expenses] Running initial check...');
    generateRecurringExpenses();
  }, 5000); // Wait 5 seconds after startup
  
  console.log('[Recurring Expenses] Scheduler started successfully');
};