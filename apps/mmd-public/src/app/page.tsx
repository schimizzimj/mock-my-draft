'use client';
import TeamLogo from '../components/team-logo';
import { capitalize } from '../lib/common-utils';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Container,
  HStack,
  Heading,
  List,
  ListItem,
  Select,
  SimpleGrid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useDraftSummary, useYears } from '../lib/draft-summary';
import { useEffect, useState, useMemo } from 'react';
import { TeamDraftSummary, Team } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import Card from '../components/card';
import {
  getContrastingColor,
  getGradeColor,
  gradeToLetter,
} from '../lib/grade-utils';
import { GradeBadge } from '../components/grade-badge';
import { HeroStats } from '../components/hero-stats';
import { ChartSkeleton, HeroStatsSkeleton } from '../components/chart-skeleton';
import {
  calculateLeagueStatistics,
  calculateYearOverYearDeltas,
  findSentimentLeaders,
  calculateSourceSentiments,
  calculateTeamSentiment,
} from '../lib/statistics';
import { Sparkline } from '../components/sparkline';
import { useAllYearsData, buildTeamHistoricalData } from '../lib/historical-data';
import { SourceToneChart } from '../components/source-tone-chart';

interface GradeRange {
  team: Team;
  range: [number, number];
}

export default function Home() {
  const [year, setYear] = useState(2024);
  const { draftSummary, isLoading } = useDraftSummary(year);
  const { draftSummary: previousYearSummary } = useDraftSummary(year - 1);
  const { years } = useYears();
  const { data: allYearsData, isLoading: isAllYearsLoading } = useAllYearsData();
  const [sources, setSources] = useState<string[]>([]);
  const [sortedTeams, setSortedTeams] = useState<TeamDraftSummary[] | null>(
    null,
  );
  const [gradeRanges, setGradeRanges] = useState<GradeRange[] | null>(null);
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    if (!draftSummary) {
      return;
    }

    setSortedTeams(
      draftSummary.teams.sort((a, b) => b.averageGrade - a.averageGrade),
    );

    // Hide chart entirely when every team has only one grade (single source)
    const allSingleSource = draftSummary.teams.every(
      (team) => team.draftGrades.length <= 1,
    );
    if (allSingleSource) {
      setGradeRanges(null);
      return;
    }

    const MIN_SPREAD = 0.05;
    const gradeRanges: GradeRange[] = [];
    draftSummary.teams.forEach((team) => {
      let min = Math.min(
        ...team.draftGrades.map((grade) => grade.gradeNumeric),
      );
      let max = Math.max(
        ...team.draftGrades.map((grade) => grade.gradeNumeric),
      );
      // Ensure zero-range bars are still visible as a thin stripe
      if (min === max) {
        min = Math.max(0, min - MIN_SPREAD);
        max = Math.min(4.3, max + MIN_SPREAD);
      }
      gradeRanges.push({
        team: team.team,
        range: [min, max],
      });
    });

    setGradeRanges(gradeRanges);
  }, [draftSummary]);

  useEffect(() => {
    if (!draftSummary) {
      return;
    }

    const sources = draftSummary.teams.reduce((acc: string[], team) => {
      const teamSources = team.draftGrades.map(
        (grade) => grade.sourceArticle.source.name,
      );
      return [...acc, ...teamSources];
    }, []);

    setSources([...new Set(sources)]);
  }, [draftSummary]);

  useEffect(() => {
    if (!years || !years.length) {
      return;
    }
    setYear(years[0]);
  }, [years]);

  // Calculate hero stats
  const heroStatsData = useMemo(() => {
    if (!draftSummary) {
      return null;
    }

    const currentYearGrades = draftSummary.teams.flatMap(team =>
      team.draftGrades.map(grade => ({
        grade: grade.grade,
        source: grade.sourceArticle.source.name,
        teamId: team.team.id,
      }))
    );

    const stats = calculateLeagueStatistics(currentYearGrades);

    let deltas = { leagueAverage: 0, sourceAgreement: 0 };
    if (previousYearSummary) {
      const previousYearGrades = previousYearSummary.teams.flatMap(team =>
        team.draftGrades.map(grade => ({
          grade: grade.grade,
          source: grade.sourceArticle.source.name,
          teamId: team.team.id,
        }))
      );
      deltas = calculateYearOverYearDeltas(currentYearGrades, previousYearGrades);
    }

    return { stats, deltas };
  }, [draftSummary, previousYearSummary]);

  const sentimentLeaders = useMemo(() => {
    if (!draftSummary) return undefined;
    return findSentimentLeaders(draftSummary.teams);
  }, [draftSummary]);

  const leagueSourceToneData = useMemo(() => {
    if (!draftSummary) return [];
    return calculateSourceSentiments(draftSummary.teams).map((s) => ({
      source: s.source.name,
      sentiment: s.avgSentiment,
    }));
  }, [draftSummary]);

  const teamSentimentMap = useMemo(() => {
    if (!draftSummary) return new Map<string, Array<{ year: number; sentiment: number }>>();
    const map = new Map<string, Array<{ year: number; sentiment: number }>>();
    for (const team of draftSummary.teams) {
      const sentiment = calculateTeamSentiment(team.draftGrades);
      if (sentiment != null) {
        map.set(team.team.id, [{ year, sentiment }]);
      }
    }
    return map;
  }, [draftSummary, year]);

  if (!draftSummary && !isLoading) {
    return (
      <Container as="main" maxW="container.xl" minH="80vh">
        <Heading>Couldn&apos;t get any data</Heading>
      </Container>
    );
  }

  if (isLoading || isAllYearsLoading) {
    return (
      <Container as="main" maxW="container.xl" my={8}>
        <Heading fontSize="4xl" mb={8}>NFL Draft Class Grades</Heading>
        <HeroStatsSkeleton />
        <ChartSkeleton />
      </Container>
    );
  }

  return (
    <Container as="main" maxW="container.xl" my={8}>
      <Heading fontSize="4xl" w="full" display="flex" justifyContent="space-between" mb={8}>
        <Text>NFL Draft Class Grades</Text>
        <Select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          w={32}
          display={'inline-block'}
        >
          {years?.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>
      </Heading>
      {heroStatsData && (
        <HeroStats
          currentYear={year}
          previousYear={year - 1}
          stats={heroStatsData.stats}
          deltas={heroStatsData.deltas}
          sentimentLeaders={sentimentLeaders}
        />
      )}
      <Card mt={8} py={4}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={draftSummary?.teams}
            margin={
              isMobile
                ? {
                    top: 5,
                    right: 5,
                    left: 5,
                    bottom: 20,
                  }
                : { top: 5, right: 30, left: 20, bottom: 5 }
            }
            layout={isMobile ? 'vertical' : 'horizontal'}
          >
            {isMobile ? (
              <>
                <XAxis
                  label={{
                    value: 'Average Grade',
                    position: 'bottom',
                  }}
                  domain={[0, 4.3]}
                  type="number"
                />
                <YAxis dataKey="team.abbreviation" type="category" />
              </>
            ) : (
              <>
                <XAxis dataKey="team.abbreviation" />
                <YAxis
                  label={{
                    value: 'Average Grade',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                  domain={[0, 4.3]}
                />
              </>
            )}
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !label) {
                  return null;
                }
                const draftSummary = payload[0].payload as TeamDraftSummary;
                const team = draftSummary.team;
                return (
                  <Box
                    bg="elevations.dark.dp08"
                    p={4}
                    rounded="lg"
                    borderColor={`${team.colors[0]}40`}
                    borderStyle={'solid'}
                    borderWidth={1}
                    boxShadow={`0 4px 20px ${team.colors[0]}30, 0 0 40px ${team.colors[0]}20`}
                    backdropFilter="blur(12px)"
                  >
                    <Box>
                      <TeamLogo
                        size="medium"
                        teamAbbreviation={team.abbreviation}
                      />
                    </Box>
                    <Text fontWeight="bold">{team.name}</Text>
                    <Text fontWeight="bold">
                      Average: {draftSummary.averageGrade.toFixed(2)}
                    </Text>
                  </Box>
                );
              }}
            />
            <Bar dataKey="averageGrade">
              {draftSummary?.teams.map((entry: TeamDraftSummary) => {
                return <Cell key={entry.team.id} fill={entry.team.colors[0]} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Box mt={8} py={4}>
        <SimpleGrid
          columns={{
            base: 1,
            md: 2,
          }}
          columnGap={4}
          rowGap={4}
        >
          <Card flex={1} py={4} px={8}>
            <Heading size="lg" mb={4}>Top performers</Heading>
            <List>
              {sortedTeams &&
                sortedTeams.slice(0, 3).map((team) => (
                  <HStack
                    key={team.team.id}
                    w="full"
                    justifyContent="space-between"
                    mt={4}
                  >
                    <HStack>
                      <TeamLogo
                        teamAbbreviation={team.team.abbreviation}
                        size="medium"
                        href={`/teams/${team.team.id}`}
                      />{' '}
                      <Text key={team.team.id} fontSize="1.2rem">
                        {team.team.name}
                      </Text>
                    </HStack>
                    <GradeBadge grade={team.averageGrade} />
                  </HStack>
                ))}
            </List>
          </Card>
          <Card flex={1}>
            <Heading size="lg" mb={4}>Bottom performers</Heading>
            <List>
              {sortedTeams &&
                sortedTeams.slice(-3).map((team) => (
                  <HStack
                    key={team.team.id}
                    w="full"
                    justifyContent="space-between"
                    mt={4}
                  >
                    <HStack>
                      <TeamLogo
                        teamAbbreviation={team.team.abbreviation}
                        size="medium"
                        href={`/teams/${team.team.id}`}
                      />{' '}
                      <Text key={team.team.id} fontSize="1.2rem">
                        {team.team.name}
                      </Text>
                    </HStack>
                    <GradeBadge grade={team.averageGrade} />
                  </HStack>
                ))}
            </List>
          </Card>
        </SimpleGrid>
      </Box>
      {gradeRanges && (
        <Card py={4} mt={8}>
          <Box mb={4} w="full" textAlign="center">
            <Heading size="md">Grade ranges</Heading>
          </Box>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={gradeRanges}
              layout={isMobile ? 'vertical' : 'horizontal'}
              margin={
                isMobile
                  ? { top: 5, right: 5, left: 5, bottom: 20 }
                  : {
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }
              }
            >
              {isMobile ? (
                <>
                  <XAxis
                    label={{
                      value: 'Grade Range',
                      position: 'bottom',
                    }}
                    domain={[0, 4.3]}
                    type="number"
                    tick={(props) => {
                      return (
                        <g transform={`translate(${props.x},${props.y})`}>
                          <text
                            x={0}
                            y={0}
                            dy={2}
                            textAnchor="middle"
                            alignmentBaseline="hanging"
                            fill="#666"
                          >
                            {gradeToLetter(props.payload.value)}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <YAxis
                    dataKey="team.abbreviation"
                    type="category"
                    width={40}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey="team.abbreviation"
                    height={40}
                    tick={({ x, y, payload }) => {
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text
                            x={0}
                            y={0}
                            dy={16}
                            textAnchor="middle"
                            fill="#666"
                          >
                            {payload.value}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <YAxis
                    label={{
                      value: 'Grade Range',
                      angle: -90,
                      position: 'insideLeft',
                    }}
                    domain={[0, 4.3]}
                    tick={(props) => {
                      return (
                        <g transform={`translate(${props.x},${props.y})`}>
                          <text
                            x={0}
                            y={0}
                            textAnchor="end"
                            alignmentBaseline="middle"
                            fill="#666"
                          >
                            {gradeToLetter(props.payload.value)}
                          </text>
                        </g>
                      );
                    }}
                    tickCount={3}
                  />
                </>
              )}
              <Tooltip
                content={({ payload }) => {
                  if (!payload || !payload.length || !payload[0].payload) {
                    return null;
                  }
                  const gradeRange = payload[0].payload as GradeRange;
                  const team = gradeRange.team;
                  return (
                    <Box
                      bg="elevations.dark.dp08"
                      p={4}
                      rounded="lg"
                      borderColor={`${team.colors[0]}40`}
                      borderStyle={'solid'}
                      borderWidth={1}
                      boxShadow={`0 4px 20px ${team.colors[0]}30, 0 0 40px ${team.colors[0]}20`}
                      backdropFilter="blur(12px)"
                    >
                      <Box>
                        <TeamLogo
                          size="medium"
                          teamAbbreviation={team.abbreviation}
                        />
                      </Box>
                      <Text fontWeight="bold">{team.name}</Text>
                      <Text fontWeight="bold">
                        {gradeToLetter(gradeRange.range[0]) ===
                        gradeToLetter(gradeRange.range[1]) ? (
                          <Badge
                            bg={getGradeColor(gradeRange.range[0])}
                            color={getContrastingColor(
                              getGradeColor(gradeRange.range[0]),
                            )}
                            p={1}
                            fontSize={'0.9rem'}
                          >
                            {gradeToLetter(gradeRange.range[0])}
                          </Badge>
                        ) : (
                          <>
                            <Badge
                              bg={getGradeColor(gradeRange.range[0])}
                              color={getContrastingColor(
                                getGradeColor(gradeRange.range[0]),
                              )}
                              mr={2}
                              p={1}
                              fontSize={'0.9rem'}
                            >
                              {gradeToLetter(gradeRange.range[0])}
                            </Badge>
                            to
                            <Badge
                              ml={2}
                              p={1}
                              fontSize={'0.9rem'}
                              bg={getGradeColor(gradeRange.range[1])}
                              color={getContrastingColor(
                                getGradeColor(gradeRange.range[1]),
                              )}
                            >
                              {gradeToLetter(gradeRange.range[1])}
                            </Badge>
                          </>
                        )}
                      </Text>
                    </Box>
                  );
                }}
              />
              <Bar dataKey="range">
                {gradeRanges?.map((entry: GradeRange) => {
                  return (
                    <Cell
                      key={entry.team.id}
                      fill={entry.team.colors[0]}
                      strokeWidth={1}
                      stroke={entry.team.colors[0]}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
      {leagueSourceToneData.length > 0 && (
        <Card py={4} mt={8}>
          <SourceToneChart
            data={leagueSourceToneData}
            title="League-Wide Source Tone"
          />
        </Card>
      )}
      {!isMobile ? (
        <Card py={4} mt={8}>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Team</Th>
                  {sources.map((source) => (
                    <Th key={source}>{capitalize(source)}</Th>
                  ))}
                  <Th>Average</Th>
                  <Th>Trend</Th>
                </Tr>
              </Thead>
              <Tbody>
                {draftSummary?.teams.map((entry: TeamDraftSummary) => {
                  return (
                    <Tr key={entry.team.id}>
                      <Td>
                        <HStack>
                          <TeamLogo
                            teamAbbreviation={entry.team.abbreviation}
                            size="medium"
                            href={`/teams/${entry.team.id}`}
                          />
                          <Text marginLeft={5}>{entry.team.name}</Text>
                        </HStack>
                      </Td>
                      {entry.draftGrades.map((grade) => {
                        return (
                          <Td key={grade.id}>
                            <GradeBadge grade={grade.gradeNumeric} />
                          </Td>
                        );
                      })}
                      <Td>
                        <GradeBadge grade={entry.averageGrade} />
                      </Td>
                      <Td>
                        {allYearsData && (
                          <Sparkline
                            data={buildTeamHistoricalData(allYearsData, entry.team.id)}
                            color={getGradeColor(entry.averageGrade)}
                            sentimentData={teamSentimentMap.get(entry.team.id)}
                          />
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        <Card py={4} my={8}>
          <Accordion allowToggle>
            {draftSummary?.teams.map((entry: TeamDraftSummary) => {
              return (
                <AccordionItem key={entry.team.id}>
                  <Heading borderBottom="1px solid" borderColor="gray.100">
                    <AccordionButton>
                      <Box as="span" flex="1" textAlign="left">
                        <HStack>
                          <TeamLogo
                            teamAbbreviation={entry.team.abbreviation}
                            size="medium"
                            href={`/teams/${entry.team.id}`}
                          />
                          <Text marginLeft={5}>{entry.team.name}</Text>
                        </HStack>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </Heading>
                  <AccordionPanel pb={4}>
                    {allYearsData && (
                      <Box mb={4}>
                        <Text fontSize="xs" color="gray.500" mb={2}>6-Year Trend</Text>
                        <Sparkline
                          data={buildTeamHistoricalData(allYearsData, entry.team.id)}
                          color={getGradeColor(entry.averageGrade)}
                          sentimentData={teamSentimentMap.get(entry.team.id)}
                        />
                      </Box>
                    )}
                    <List>
                      {entry.draftGrades
                        .sort((a, b) =>
                          a.sourceArticle.source.name >
                          b.sourceArticle.source.name
                            ? 1
                            : -1,
                        )
                        .map((grade) => {
                          return (
                            <ListItem
                              key={grade.id}
                              my={3}
                              w="full"
                              display="flex"
                              justifyContent="space-between"
                            >
                              <Text as="span">
                                {capitalize(grade.sourceArticle.source.name)}
                              </Text>
                              <GradeBadge grade={grade.gradeNumeric} mr={2} />
                            </ListItem>
                          );
                        })}
                    </List>
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
        </Card>
      )}
    </Container>
  );
}
