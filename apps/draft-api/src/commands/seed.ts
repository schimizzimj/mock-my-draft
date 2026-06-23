import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from '../database';
import { seedDraftClasses } from './seed-steps/seed-draft-classes';
import { seedDraftClassGrades } from './seed-steps/seed-draft-class-grades';
import { seedPlayerGrades } from './seed-steps/seed-player-grades';
import { seedPlayers } from './seed-steps/seed-players';
import { seedTeams } from './seed-steps/seed-teams';
import { seedTextAnalysis } from './seed-steps/seed-text-analysis';

type StepName = 'teams' | 'players' | 'draft-classes' | 'grades' | 'player-grades' | 'text-analysis';

export type SeedResult = {
  step: string;
  success: number;
  failed: number;
  skipped: number;
};

const VALID_STEPS: StepName[] = ['teams', 'players', 'draft-classes', 'grades', 'player-grades', 'text-analysis'];

function parseArgs(): { steps: StepName[] | null; year: number } {
  const args = process.argv.slice(2);
  let steps: StepName[] | null = null;
  let year = new Date().getFullYear();

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--step' && args[i + 1]) {
      const stepArg = args[i + 1];
      if (!VALID_STEPS.includes(stepArg as StepName)) {
        console.error(`Unknown step: "${stepArg}". Valid steps: ${VALID_STEPS.join(', ')}`);
        process.exit(1);
      }
      steps = [stepArg as StepName];
      i++;
    }
    if (args[i] === '--year' && args[i + 1]) {
      year = parseInt(args[i + 1], 10);
      if (isNaN(year)) {
        console.error(`Invalid year: "${args[i + 1]}"`);
        process.exit(1);
      }
      i++;
    }
  }

  return { steps, year };
}

async function main() {
  const { steps, year } = parseArgs();
  console.log(`\n=== Database Seed Script ===`);
  console.log(`Year: ${year}`);
  console.log(`Steps: ${steps ? steps.join(', ') : 'all'}\n`);

  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  console.log('Database connected (migrations applied).\n');

  const results: SeedResult[] = [];
  const allSteps: StepName[] = ['teams', 'players', 'draft-classes', 'grades', 'player-grades', 'text-analysis'];
  const stepsToRun = steps ?? allSteps;

  for (const step of stepsToRun) {
    console.log(`--- Running step: ${step} ---`);
    let result: SeedResult;

    switch (step) {
      case 'teams':
        result = await seedTeams();
        break;
      case 'players':
        result = await seedPlayers(year);
        break;
      case 'draft-classes':
        result = await seedDraftClasses(year);
        break;
      case 'grades':
        result = await seedDraftClassGrades(year);
        break;
      case 'player-grades':
        result = await seedPlayerGrades(year);
        break;
      case 'text-analysis':
        result = await seedTextAnalysis(year);
        break;
      default:
        console.log(`  Step "${step}" not yet implemented.\n`);
        continue;
    }

    results.push(result);
    console.log(
      `  Done: ${result.success} created, ${result.failed} failed, ${result.skipped} skipped\n`,
    );
  }

  console.log('\n=== Seed Summary ===');
  for (const result of results) {
    console.log(
      `  ${result.step}: ${result.success} created, ${result.failed} failed, ${result.skipped} skipped`,
    );
  }

  await AppDataSource.destroy();
  console.log('\nDone.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
