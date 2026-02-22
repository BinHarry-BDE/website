import type { Metadata } from 'next';

type Winner = {
  rank: 1 | 2 | 3;
  title: string;
  team: string;
  imagePlaceholder: string;
  githubUrl: string;
};

type GameEntry = {
  id: string;
  title: string;
  team: string;
  imagePlaceholder: string;
  githubUrl: string;
  isPodium?: boolean;
};

type GameJamYear = {
  year: string;
  winners: Winner[];
  allGames: GameEntry[];
};

const gameJamResults: GameJamYear[] = [
  {
    year: '2025',
    winners: [
      {
        rank: 1,
        title: 'Nom du jeu gagnant #1',
        team: 'Equipe Alpha',
        imagePlaceholder: 'Placeholder image - jeu #1',
        githubUrl: '#',
      },
      {
        rank: 2,
        title: 'Nom du jeu gagnant #2',
        team: 'Equipe Beta',
        imagePlaceholder: 'Placeholder image - jeu #2',
        githubUrl: '#',
      },
      {
        rank: 3,
        title: 'Nom du jeu gagnant #3',
        team: 'Equipe Gamma',
        imagePlaceholder: 'Placeholder image - jeu #3',
        githubUrl: '#',
      },
    ],
    allGames: [
      {
        id: '2025-top-1',
        title: 'Nom du jeu gagnant #1',
        team: 'Equipe Alpha',
        imagePlaceholder: 'Placeholder image - jeu #1',
        githubUrl: '#',
        isPodium: true,
      },
      {
        id: '2025-top-2',
        title: 'Nom du jeu gagnant #2',
        team: 'Equipe Beta',
        imagePlaceholder: 'Placeholder image - jeu #2',
        githubUrl: '#',
        isPodium: true,
      },
      {
        id: '2025-top-3',
        title: 'Nom du jeu gagnant #3',
        team: 'Equipe Gamma',
        imagePlaceholder: 'Placeholder image - jeu #3',
        githubUrl: '#',
        isPodium: true,
      },
      {
        id: '2025-game-4',
        title: 'Nom du jeu participant #4',
        team: 'Equipe Delta',
        imagePlaceholder: 'Placeholder image - jeu #4',
        githubUrl: '#',
      },
      {
        id: '2025-game-5',
        title: 'Nom du jeu participant #5',
        team: 'Equipe Epsilon',
        imagePlaceholder: 'Placeholder image - jeu #5',
        githubUrl: '#',
      },
      {
        id: '2025-game-6',
        title: 'Nom du jeu participant #6',
        team: 'Equipe Zeta',
        imagePlaceholder: 'Placeholder image - jeu #6',
        githubUrl: '#',
      },
    ],
  },
  {
    year: '2024',
    winners: [
      {
        rank: 1,
        title: 'Nom du jeu gagnant #1',
        team: 'Equipe Delta',
        imagePlaceholder: 'Placeholder image - jeu #1',
        githubUrl: '#',
      },
      {
        rank: 2,
        title: 'Nom du jeu gagnant #2',
        team: 'Equipe Epsilon',
        imagePlaceholder: 'Placeholder image - jeu #2',
        githubUrl: '#',
      },
      {
        rank: 3,
        title: 'Nom du jeu gagnant #3',
        team: 'Equipe Zeta',
        imagePlaceholder: 'Placeholder image - jeu #3',
        githubUrl: '#',
      },
    ],
    allGames: [
      {
        id: '2024-top-1',
        title: 'Nom du jeu gagnant #1',
        team: 'Equipe Delta',
        imagePlaceholder: 'Placeholder image - jeu #1',
        githubUrl: '#',
        isPodium: true,
      },
      {
        id: '2024-top-2',
        title: 'Nom du jeu gagnant #2',
        team: 'Equipe Epsilon',
        imagePlaceholder: 'Placeholder image - jeu #2',
        githubUrl: '#',
        isPodium: true,
      },
      {
        id: '2024-top-3',
        title: 'Nom du jeu gagnant #3',
        team: 'Equipe Zeta',
        imagePlaceholder: 'Placeholder image - jeu #3',
        githubUrl: '#',
        isPodium: true,
      },
      {
        id: '2024-game-4',
        title: 'Nom du jeu participant #4',
        team: 'Equipe Lambda',
        imagePlaceholder: 'Placeholder image - jeu #4',
        githubUrl: '#',
      },
      {
        id: '2024-game-5',
        title: 'Nom du jeu participant #5',
        team: 'Equipe Sigma',
        imagePlaceholder: 'Placeholder image - jeu #5',
        githubUrl: '#',
      },
      {
        id: '2024-game-6',
        title: 'Nom du jeu participant #6',
        team: 'Equipe Omega',
        imagePlaceholder: 'Placeholder image - jeu #6',
        githubUrl: '#',
      },
    ],
  },
];

const rankLabel: Record<Winner['rank'], string> = {
  1: '1er',
  2: '2eme',
  3: '3eme',
};

export const metadata: Metadata = {
  title: 'GameJam',
  description: 'Decouvrez tous les jeux de chaque edition et le podium choisi par la communaute.',
};

export default function GameJamPage() {
  return (
    <section className="gamejam-page">
      <header className="gamejam-header">
        <span className="section-label">GAMEJAM</span>
        <h1 className="gamejam-title">Creer, partager, progresser</h1>
        <p className="gamejam-subtitle">
          La GameJam BinHarry met la creation et l&apos;entraide au premier plan.
          Le podium met en avant les coups de coeur de la communaute, mais tous les jeux de chaque edition sont accessibles ci-dessous.
        </p>
      </header>

      <div className="gamejam-years">
        {gameJamResults.map((edition) => (
          <article key={edition.year} className="gamejam-year-block">
            <div className="gamejam-year-head">
              <h2>Edition {edition.year}</h2>
            </div>
            <div className="gamejam-year-intro">
              <h3>Podium de la communaute</h3>
              <p>Trois projets mis en avant selon les votes et retours des etudiants.</p>
            </div>
            <div className="gamejam-podium-grid">
              {edition.winners.map((winner) => (
                <div
                  key={`${edition.year}-${winner.rank}`}
                  className={`gamejam-card gamejam-rank-${winner.rank}`}
                >
                  <div className="gamejam-rank-badge">{rankLabel[winner.rank]}</div>
                  <div className="gamejam-image-placeholder">{winner.imagePlaceholder}</div>
                  <div className="gamejam-card-content">
                    <h3>{winner.title}</h3>
                    <p>{winner.team}</p>
                    <a href={winner.githubUrl} className="gamejam-link">
                      Lien GitHub (a remplacer)
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="gamejam-all-games">
              <div className="gamejam-all-games-head">
                <h3>Tous les jeux de l&apos;edition {edition.year}</h3>
                <p>Explore l&apos;ensemble des projets realises pendant la GameJam.</p>
              </div>
              <div className="gamejam-all-games-grid">
                {edition.allGames.map((game) => (
                  <div key={game.id} className="gamejam-all-game-card">
                    {game.isPodium && <span className="gamejam-top-badge">Top 3</span>}
                    <div className="gamejam-all-game-image">{game.imagePlaceholder}</div>
                    <div className="gamejam-all-game-content">
                      <h4>{game.title}</h4>
                      <p>{game.team}</p>
                      <a href={game.githubUrl} className="gamejam-link">
                        Lien GitHub (a remplacer)
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
