'use client';
import TeamLogo from '../../../components/team-logo';
import { capitalize } from '../../../lib/common-utils';
import {
  Box,
  Container,
  Flex,
  Heading,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Badge,
  SimpleGrid,
  useBreakpointValue,
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
  AccordionIcon,
  HStack,
  Link,
  Button,
  Select,
} from '@chakra-ui/react';
import { useEffect, useState, useMemo } from 'react';
import { useTeamDraftSummary, useYears } from '../../../lib/draft-summary';
import { DraftGrade } from '../../../types';
import { YearSummary } from '../../../lib/historical-data';
import Card from '../../../components/card';
import { HistoricalChart } from '../../../components/historical-chart';
import { DivisionComparison } from '../../../components/division-comparison';
import { useAllYearsData, buildTeamHistoricalData } from '../../../lib/historical-data';
import { calculateLeagueStatistics, buildDivisionComparisons } from '../../../lib/statistics';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getGradeColor } from '../../../lib/grade-utils';
import { useDraftClass } from '../../../lib/draft-class';
import { GradeBadge } from '../../../components/grade-badge';
import { ChartSkeleton, StatsCardSkeleton, TableSkeleton } from '../../../components/chart-skeleton';
import { SentimentBadge } from '../../../components/sentiment-badge';
import { WordCloud } from '../../../components/word-cloud';
import { SourceToneChart } from '../../../components/source-tone-chart';
import { SentimentGradeScatter } from '../../../components/sentiment-grade-scatter';
import { aggregateKeywords } from '../../../lib/statistics';

interface GradeCount {
  grade: string;
  count: number;
}

export default function TeamPage({ params }: { params: { teamId: string } }) {
  const [year, setYear] = useState(2024);
  const { years, isLoading: isYearsLoading } = useYears();
  const { draftSummary, isLoading } = useTeamDraftSummary(year, params.teamId);
  const { draftClass, isLoading: isDraftClassLoading } = useDraftClass(
    year,
    params.teamId,
  );
  const { data: allYearsData, isLoading: isAllYearsLoading } = useAllYearsData();
  const [sortedGrades, setSortedGrades] = useState<DraftGrade[] | null>(null);
  const [gradeCounts, setGradeCounts] = useState<GradeCount[] | null>(null);
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    if (years) {
      setYear(years[0]);
    }
  }, [years]);

  useEffect(() => {
    if (!draftSummary) {
      return;
    }

    setSortedGrades(
      draftSummary.draftGrades
        .sort((a, b) => b.gradeNumeric - a.gradeNumeric)
        .map((grade) => ({
          ...grade,
          grade: grade.grade.toUpperCase(),
        })),
    );

    const counts: GradeCount[] = [];
    for (const grade of draftSummary.draftGrades.map((g) => ({
      ...g,
      grade: g.grade.toUpperCase(),
    }))) {
      const existingGrade = counts.find((g) => g.grade === grade.grade);
      if (existingGrade) {
        existingGrade.count++;
      } else {
        counts.push({ grade: grade.grade, count: 1 });
      }
    }
    setGradeCounts(counts);
  }, [draftSummary]);

  // Calculate team historical data for HistoricalChart
  const teamHistoricalData = useMemo(() => {
    if (!allYearsData || !draftSummary) return null;
    return buildTeamHistoricalData(allYearsData, draftSummary.team.id);
  }, [allYearsData, draftSummary]);

  // Calculate league averages for HistoricalChart
  const leagueAverages = useMemo(() => {
    if (!allYearsData) return null;
    return allYearsData.map((yearData) => {
      // Flatten all teams' grades for this year
      const allGrades = yearData.teams?.flatMap((team) =>
        team.draftGrades.map((grade) => ({
          grade: grade.grade,
          source: grade.sourceArticle.source.name,
          teamId: team.team.id,
        }))
      ) || [];

      const stats = calculateLeagueStatistics(allGrades);
      return { year: yearData.year, average: stats.leagueAverage };
    });
  }, [allYearsData]);

  // Calculate division comparison data
  const divisionComparisonData = useMemo(() => {
    if (!draftSummary || !allYearsData) return null;

    // Get current year's data for all teams
    const currentYearData = allYearsData.find(yearData =>
      yearData.year === year
    );

    if (!currentYearData) return null;

    // Extract grades for buildDivisionComparisons
    const allGrades = currentYearData.teams?.flatMap((team) =>
      team.draftGrades.map((grade) => ({
        grade: grade.grade,
        source: grade.sourceArticle.source.name,
        teamId: team.team.id,
      }))
    ) || [];

    // Build teams array with division/conference (from API response)
    const teams = currentYearData.teams?.map((t: YearSummary['teams'][number]) => ({
      id: t.team.id,
      name: t.team.name,
      division: t.team.division,
      conference: t.team.conference,
    })) || [];

    return buildDivisionComparisons(allGrades, draftSummary.team.id, teams);
  }, [draftSummary, allYearsData, year]);

  // Aggregate keywords for this team's grades
  const teamKeywords = useMemo(() => {
    if (!draftSummary) return [];
    return aggregateKeywords(draftSummary.draftGrades);
  }, [draftSummary]);

  // Source tone data for this team
  const sourceToneData = useMemo(() => {
    if (!draftSummary) return [];
    return draftSummary.draftGrades
      .filter((g) => g.sentimentCompound != null)
      .map((g) => ({
        source: g.sourceArticle.source.name,
        sentiment: g.sentimentCompound!,
      }))
      .sort((a, b) => b.sentiment - a.sentiment);
  }, [draftSummary]);

  // Scatter plot data
  const sentimentGradeData = useMemo(() => {
    if (!draftSummary) return [];
    return draftSummary.draftGrades
      .filter((g) => g.sentimentCompound != null)
      .map((g) => ({
        source: g.sourceArticle.source.name,
        grade: g.gradeNumeric,
        sentiment: g.sentimentCompound!,
      }));
  }, [draftSummary]);

  if (!draftSummary && !isLoading) {
    return null;
  }

  if (isLoading || isYearsLoading || isDraftClassLoading || isAllYearsLoading) {
    return (
      <Container as="main" maxW="container.xl" my={8}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </SimpleGrid>
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <TableSkeleton rows={10} />
      </Container>
    );
  }

  return (
    <Container as="main" maxW="container.xl" my={8}>
      {!draftSummary ? (
        <Heading>Team not found</Heading>
      ) : (
        <>
          <Flex justifyContent="space-between" mb={8}>
            <HStack as="span">
              <TeamLogo
                teamAbbreviation={draftSummary.team.abbreviation}
                size="medium"
              />
              <Heading fontSize="3xl">{capitalize(draftSummary.team.name)}</Heading>
            </HStack>
            <Box as="span" display="inline-block">
              <Select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {years?.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </Box>
          </Flex>
          <SimpleGrid
            marginTop={8}
            pt={4}
            columns={{
              base: 1,
              md: 3,
            }}
            rowGap={4}
            columnGap={4}
          >
            <Card flex={1} h={36}>
              <Stat>
                <StatLabel>Average grade</StatLabel>
                <StatNumber mt={2}>
                  <GradeBadge grade={draftSummary.averageGrade} fontSize="2rem" />
                </StatNumber>
              </Stat>
            </Card>
            {sortedGrades && sortedGrades?.length > 0 && (
              <Card flex={1} h={36}>
                <Stat>
                  <StatLabel>Highest grade</StatLabel>
                  <StatNumber mt={2}>
                    <GradeBadge grade={sortedGrades[0].gradeNumeric} fontSize="2rem" />
                  </StatNumber>
                  <StatHelpText>
                    Source: {sortedGrades[0].sourceArticle.source.name}
                  </StatHelpText>
                </Stat>
              </Card>
            )}
            {sortedGrades && sortedGrades?.length > 0 && (
              <Card flex={1} h={36}>
                <Stat>
                  <StatLabel>Lowest grade</StatLabel>
                  <StatNumber mt={2}>
                    <GradeBadge grade={sortedGrades[sortedGrades.length - 1].gradeNumeric} fontSize="2rem" />
                  </StatNumber>
                  <StatHelpText>
                    Source:{' '}
                    {
                      sortedGrades[sortedGrades.length - 1].sourceArticle.source
                        .name
                    }
                  </StatHelpText>
                </Stat>
              </Card>
            )}
          </SimpleGrid>
          {draftClass && (
            <Card mt={8} py={4}>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Round</Th>
                      <Th>Pick</Th>
                      <Th>Player</Th>
                      <Th>Position</Th>
                      <Th>College</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {draftClass.draftPicks.map((pick) => (
                      <Tr key={pick.id}>
                        <Td>{pick.round}</Td>
                        <Td>{pick.pickNumber}</Td>
                        <Td>{pick.player?.name}</Td>
                        <Td>
                          <Badge fontSize="1.2rem">
                            {pick.player?.position}
                          </Badge>
                        </Td>
                        <Td>{pick.player?.college ?? '--'}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Card>
          )}
          {gradeCounts && (
            <Card mt={8} py={4}>
              <Heading size="md">Grade distribution</Heading>
              <Box>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={gradeCounts}
                    layout={isMobile ? 'vertical' : 'horizontal'}
                  >
                    <XAxis
                      dataKey={isMobile ? 'count' : 'grade'}
                      type={isMobile ? 'number' : 'category'}
                    />
                    <YAxis
                      dataKey={isMobile ? 'grade' : 'count'}
                      type={isMobile ? 'category' : 'number'}
                      width={isMobile ? 30 : undefined}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !label) {
                          return null;
                        }

                        const grade = payload[0].payload as GradeCount;
                        const sources = draftSummary.draftGrades.filter(
                          (g) =>
                            g.grade.toUpperCase() === grade.grade.toUpperCase(),
                        );
                        return (
                          <Box
                            bg="elevations.dark.dp08"
                            p={4}
                            rounded="lg"
                            borderColor={`${getGradeColor(grade.grade)}40`}
                            borderStyle={'solid'}
                            borderWidth={1}
                            boxShadow={`0 4px 20px ${getGradeColor(grade.grade)}30, 0 0 40px ${getGradeColor(grade.grade)}20`}
                            backdropFilter="blur(12px)"
                          >
                            <Text fontWeight="bold">{grade.grade}</Text>
                            <Text fontWeight="bold">Count: {grade.count}</Text>
                            <Text fontWeight="bold">
                              Sources:{' '}
                              {sources
                                .map((s) =>
                                  capitalize(s.sourceArticle.source.name),
                                )
                                .join(', ')}
                            </Text>
                          </Box>
                        );
                      }}
                    />
                    <Bar dataKey="count">
                      {gradeCounts.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getGradeColor(entry.grade)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          )}
          {teamHistoricalData && leagueAverages && (
            <Card mt={8} py={4}>
              <HistoricalChart
                teamData={teamHistoricalData}
                leagueAverages={leagueAverages}
                teamColor={getGradeColor(draftSummary.averageGrade)}
                teamName={draftSummary.team.name}
              />
            </Card>
          )}
          {divisionComparisonData && (
            <Card mt={8} py={4}>
              <DivisionComparison
                divisionTeams={divisionComparisonData}
                currentTeamId={draftSummary.team.id}
              />
            </Card>
          )}
          {teamKeywords.length > 0 && (
            <Card mt={8} py={4}>
              <WordCloud
                keywords={teamKeywords}
                color={draftSummary.team.colors?.[0]}
              />
            </Card>
          )}
          {sourceToneData.length > 0 && (
            <Card mt={8} py={4}>
              <SourceToneChart data={sourceToneData} />
            </Card>
          )}
          {sentimentGradeData.length > 0 && (
            <Card mt={8} py={4}>
              <SentimentGradeScatter data={sentimentGradeData} />
            </Card>
          )}
          <Card mt={8} py={4}>
            {isMobile ? (
              <Accordion allowToggle>
                {draftSummary.draftGrades.map((grade: DraftGrade) => (
                  <AccordionItem key={grade.id}>
                    <Heading
                      borderBottom={'1px solid'}
                      p={2}
                      borderColor="gray.100"
                    >
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <HStack justifyContent="space-between" mr={2}>
                            <Text>{grade.sourceArticle.source.name}</Text>
                            <HStack>
                              <GradeBadge grade={grade.gradeNumeric} fontSize="1.2rem" />
                              <SentimentBadge sentiment={grade.sentimentCompound} />
                            </HStack>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </Heading>
                    <AccordionPanel>
                      <Text whiteSpace="preserve">{grade.text}</Text>
                      <Text mt={2}>
                        <Button
                          as={Link}
                          variant={'link'}
                          href={grade.sourceArticle.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          colorScheme={'blue'}
                        >
                          View Source
                        </Button>
                      </Text>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <TableContainer marginTop={8} py={4} overflowX="auto">
                <Table overflowX="auto" width="max-content">
                  <Thead>
                    <Tr>
                      <Th>Source</Th>
                      <Th>Grade</Th>
                      <Th>Evaluation</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {draftSummary.draftGrades.map(
                      (response: DraftGrade, index: number) => (
                        <Tr key={index}>
                          <Td>
                            {capitalize(response.sourceArticle.source.name)}
                          </Td>
                          <Td>
                            <GradeBadge grade={response.gradeNumeric} fontSize="1.2rem" />
                            <SentimentBadge sentiment={response.sentimentCompound} />
                          </Td>
                          <Td
                            whiteSpace="normal"
                            overflowWrap="break-word"
                            minWidth="150px"
                            maxWidth="800px"
                          >
                            <Text whiteSpace="preserve">{response.text}</Text>
                            <Text mt={2}>
                              <Button
                                as={Link}
                                variant={'link'}
                                href={response.sourceArticle.url}
                                target="_blank"
                                rel="noreferrer noopener"
                                colorScheme={'primary'}
                              >
                                View Source
                              </Button>
                            </Text>
                          </Td>
                        </Tr>
                      ),
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </>
      )}
    </Container>
  );
}
