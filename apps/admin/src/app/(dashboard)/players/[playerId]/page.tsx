'use client';

import { usePlayer } from '@/lib/players';
import { Player } from '@/types';
import { EditIcon } from '@chakra-ui/icons';
import {
  Box,
  VStack,
  Text,
  HStack,
  Stack,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import PlayersDrawer from '../components/players-drawer';

function PlayerPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const { player, isLoading } = usePlayer(playerId);
  const editButtonRef = useRef(null);
  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({});
  const { isOpen, onClose, onOpen } = useDisclosure();

  const handleEdit = (player: Player) => {
    setNewPlayer(player);
    onOpen();
  };

  const formattedHeight = (height: number) => {
    const feet = Math.floor(height / 12);
    const inches = height % 12;

    return `${feet}'${inches}"`;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!player) {
    return <div>Player not found</div>;
  }

  return (
    <VStack spacing={4} align="start">
      <Text fontSize="2xl">Player Details</Text>
      <HStack width="96" maxW="full" justifyContent="space-between">
        <Text fontSize="1.5rem">{player.name}</Text>
        <Text fontSize="1.5rem">{player.position}</Text>
      </HStack>
      <Stack>
        <Text>College: {player.college ? player.college : '--'}</Text>
        <Text>Hometown: {player.hometown ? player.hometown : '--'}</Text>
        <Text>
          Height: {player.height ? formattedHeight(player.height) : '--'}
        </Text>
        <Text>Weight: {player.weight ? `${player.weight}lbs` : '--'}</Text>
        <Text>
          Arm Length: {player.armLength ? `${player.armLength}"` : '--'}
        </Text>
        <Text>Hand Size: {player.handSize ? `${player.handSize}"` : '--'}</Text>
        <Text>
          40-Yard Dash: {player.fortyYardDash ? player.fortyYardDash : '--'}
        </Text>
        <Text>
          10-Yard Split: {player.tenYardSplit ? player.tenYardSplit : '--'}
        </Text>
        <Text>
          20-Yard Split:{' '}
          {player.twentyYardSplit ? player.twentyYardSplit : '--'}
        </Text>
        <Text>
          20-Yard Shuttle:{' '}
          {player.twentyYardShuttle ? player.twentyYardShuttle : '--'}
        </Text>
        <Text>
          Three-Cone Drill:{' '}
          {player.threeConeDrill ? player.threeConeDrill : '--'}
        </Text>
        <Text>
          Vertical Jump: {player.verticalJump ? player.verticalJump : '--'}
        </Text>
        <Text>Broad Jump: {player.broadJump ? player.broadJump : '--'}</Text>
        <Text>Bench Press: {player.benchPress ? player.benchPress : '--'}</Text>
      </Stack>
      <Button
        colorScheme="primary"
        size="sm"
        position="absolute"
        right="0"
        onClick={() => handleEdit(player)}
      >
        <EditIcon />
      </Button>
      <PlayersDrawer
        player={newPlayer}
        onChange={setNewPlayer}
        isOpen={isOpen}
        onClose={onClose}
        toggleBtnRef={editButtonRef}
      />
    </VStack>
  );
}

const WrappedPlayerPage = () => (
  <Box maxWidth="container.xl" mx="auto" mt={8} p={4} position="relative">
    <PlayerPage />
  </Box>
);

export default WrappedPlayerPage;
