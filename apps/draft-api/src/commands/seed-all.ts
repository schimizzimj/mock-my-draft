import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from '../database';
import { seedTeams } from './seed-steps/seed-teams';
import { seedPlayers } from './seed-steps/seed-players';
import { seedDraftClasses } from './seed-steps/seed-draft-classes';
import { seedDraftClassGrades } from './seed-steps/seed-draft-class-grades';
import { seedPlayerGrades } from './seed-steps/seed-player-grades';
import { seedTextAnalysis } from './seed-steps/seed-text-analysis';
import { SeedResult } from './seed';

const YEARS = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

async function main() {
  console.log('\n=== Seed All: Full Database Population ===\n');

  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  console.log('Database connected (migrations applied).\n');

  const results: SeedResult[] = [];

  // Step 1: Seed teams (year-independent)
  console.log('--- Seeding teams ---');
  const teamsResult = await seedTeams();
  results.push(teamsResult);
  console.log(`  Done: ${teamsResult.success} created, ${teamsResult.skipped} skipped\n`);

  // Step 2: Seed each year
  for (const year of YEARS) {
    console.log(`\n=== Year ${year} ===\n`);

    console.log(`--- Seeding players (${year}) ---`);
    const playersResult = await seedPlayers(year);
    results.push(playersResult);
    console.log(`  Done: ${playersResult.success} created, ${playersResult.skipped} skipped`);

    console.log(`--- Seeding draft classes (${year}) ---`);
    const draftClassesResult = await seedDraftClasses(year);
    results.push(draftClassesResult);
    console.log(`  Done: ${draftClassesResult.success} created, ${draftClassesResult.skipped} skipped`);

    console.log(`--- Seeding grades (${year}) ---`);
    const gradesResult = await seedDraftClassGrades(year);
    results.push(gradesResult);
    console.log(`  Done: ${gradesResult.success} created, ${gradesResult.skipped} skipped`);

    console.log(`--- Seeding player grades (${year}) ---`);
    const playerGradesResult = await seedPlayerGrades(year);
    results.push(playerGradesResult);
    console.log(`  Done: ${playerGradesResult.success} created, ${playerGradesResult.skipped} skipped`);

    console.log(`--- Seeding text analysis (${year}) ---`);
    const textAnalysisResult = await seedTextAnalysis(year);
    results.push(textAnalysisResult);
    console.log(`  Done: ${textAnalysisResult.success} analyzed, ${textAnalysisResult.skipped} skipped`);
  }

  // Summary
  const totalSuccess = results.reduce((sum, r) => sum + r.success, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);

  console.log('\n=== Seed All Summary ===');
  console.log(`  Total: ${totalSuccess} created, ${totalFailed} failed, ${totalSkipped} skipped`);

  await AppDataSource.destroy();
  console.log('\nDone.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Seed-all failed:', error);
  process.exit(1);
});
