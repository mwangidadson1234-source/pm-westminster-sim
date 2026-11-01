# Prime Minister: Westminster Simulator

A text-driven political survival game. You are the Prime Minister. Survive 52 weeks, keep your party together, balance the books, and win the general election.

## How to play
- **Inbox:** one crisis email each week. Every choice changes Approval, Party Loyalty, Integrity and Faction Hostility (lower is better).
- **Parliament:** move one bill forward each week. Votes happen at Second and Third Reading. Low loyalty creates rebels, and weak leaders face no-confidence votes.
- **Treasury:** present a Budget every 4 weeks. Very high taxes raise less money (Laffer curve), big deficits cause bond market panic, and underfunded services cause waiting lists and unrest.
- **Manifesto:** pick 3 pledges at the start. Keep them for a boost, break them and the opposition uses them at PMQs.
- **PMQs:** every 6 weeks. A reply your numbers cannot back up becomes a front-page disaster.
- **Election:** at week 52 your score decides if you win.

## Run it online with Vercel (easiest)
1. Upload all files to a GitHub repository using the website (Add file, then Upload files).
2. In Vercel, import the repository and tap Deploy. Vercel rebuilds every time you commit.

## Deploy to GitHub Pages (no command line)
1. Make sure `.github/workflows/deploy.yml` is in your repository. If it is missing: tap **Add file**, then **Create new file**, type `.github/workflows/deploy.yml` as the name, paste the workflow from this project, and tap **Commit changes**.
2. In your repository, open **Settings**, then **Pages**. Under **Source**, choose **GitHub Actions**.
3. Open the **Actions** tab and wait for the green tick (about 2 minutes).
4. Your game is at `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

## Project map
- `src/data/` events, bills, pledges and PMQs questions (edit these to add story)
- `src/logic/` the Parliament vote and Treasury economy rules
- `src/hooks/useGame.ts` the weekly turn engine
- `src/components/` the screens
