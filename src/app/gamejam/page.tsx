import type { Metadata } from 'next';
import GameJamClient from './GameJamClient';
import { gameJamResults } from './data';
import './gamejam.css';
import './heart.css';

export const metadata: Metadata = {
  title: 'GameJam',
  description: 'Decouvrez tous les jeux de chaque edition et le podium choisi par la communaute.',
};

export default function GameJamPage() {
  return <GameJamClient staticEditions={gameJamResults} />;
}
