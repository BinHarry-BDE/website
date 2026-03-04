# Note

Hello le nouveau BDE, je vous fait un petit fichier pour avoir toute les infos importante du developpement du site au besoin.

Le site a été developpé par l'entreprise RaceUp (race-up.net) en collaboration avec les membres du BDE, aujourd'hui le site est l'entière propriété du BDE. Mais si nécessaire vous pouvez aller sur leur site pour demander de l'aide même si la collab est finit ils sont cool et pourront vous guider

Oublier pas qu'un nom de domaine coute environ 10€ par ans
et que si le nombre d'utilisateur se met a exploser et que vous avez trop de requete pensez a aller regarder cloudflare vous risquer d'être débité

## Info

Le site n'a normalement pas besoin d'être modifier a l'avenir, vous avez un mini CMS intégré dans votre dashboard admin
il vous permet de gerer les User, ajouter des évènements et un tas d'autres choses
pas besoin de modifier le code pour ajouter des choses sur le site

Mais le site risque a l'avenir de devenir un peu obsolete, c'est pour cela qu'il est important de le maintenir.

je sais que maintenir le site risque d'être un peu compliqué au vue des stacks techniques utilisé pour le faire. (Next, cloudflare worker, API etc...), du coup au besoin contactez Jules Thiefain (vamp sur discord) ou Jacques Lucas (WaxyPine sur discord) ou tout simplement le support de RaceUp, on pourra vous donnez un coup de main.
Certain prof peuvent aussi vous donnez un coup de main mais prenez en compte que la plus part n'utilise pas Next et que le code est très long est complexe, donc pas tout les profs auront le temps.

## Developpement

Si vous voulez le maintenir vous même je vous donne quelque tips:
Normalement le code est hyper scalable (maintenable), il respecte toute les conventions et est bien documenté. Donc pas de risque de sécurité (100/100 sur Nuclei) et n'importe qu'elle IA devrait arriver a suivre le code (vous aussi du coup)

### Truc a consulté pour comprendre et améliorer le code

    - TypeScript (mettre lien github)
    - Next Course (mettre lien github)

### A avoir pour dev le site (IMPERATIVEMENT)

    - Github Etudiant (vous permet d'avoir Copilot pro gratuit) pas de honte a utilisé l'IA
    - d'autre IA : vous atteindré le max de copilot assez vite (prenez Codex gratuit, ou Claude code pour les ceux qui sont prêt a payer)
    - le compte cloudflare: Connecter vous au compte vous en aurait besoin pour voir les activité, build et tout ce qui peut être nécessaire

### Tips final

Je vous conseil fortement d'utilisez différent outils pour des features que vous souhaiterez sortir a l'avenir, notament cela :
    - Nuclei (Sécurité)
    - lighthouse (pas ouf mais le minimum)
    - Google Analytics (checker vos stats)

## Obligatoire

Si vous ne comptez rien modifié sur le site je vous conseille quand même de régulièrement être a l'affut de celui-ci, par exemple récemment y'a eu une faille 0-days chez Next, c'était pas de notre ressort mais il faut réagir assez vite. Donc je vous conseil fortement de vérifier de temps en temps le site, l'activité du site sur votre dashboard admin et sur cloudflare.
