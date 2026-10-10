# NurseBound store screenshots

Apple and Google want screenshots of the real app, so take them on your iPhone from the development build. Then
`store-assets/tools/frame.py` adds the gradient, headline and phone frame at every store size.

## 1. Fill the app with demo data (2 minutes)

1. **Save your own progress first:** More → Profile & settings → Backup & restore → Save a backup.
2. On the Mac, open `store-assets/tools/demo-backup.txt`, select all, copy. (Or AirDrop it to the iPhone, open it in
   Files, select all, copy.)
3. On the iPhone: More → Profile & settings → Backup & restore → **Restore a backup** → paste → Restore.

You now have "Maria Santos", a Filipino nurse headed to **Ontario, Canada**: first two roadmap phases done, two
Diagnostic Benchmarks (64% → 73%), 345 questions answered, a 9-day study streak, review questions due and an exam date 42 days out.

4. Unlock Pro for the shoot: More → NurseBound Pro → scroll down → **Unlock Pro for testing** (developer builds only).
5. Use the light theme (Vivid), full battery if you can, and Wi-Fi on so the Visa tab loads live data.

## 2. Take the seven shots (side button + volume up)

| Save as | Screen | How to get there |
|---|---|---|
| `1-today.png` | Today with the journey map | Today tab, scrolled to the top |
| `2-roadmap.png` | Roadmap with the Ontario province card | Roadmap tab, top of the screen |
| `3-exam.png` | Diagnostic result with categories | Exam tab → NCLEX → History → tap the latest Diagnostic Benchmark to open its category bars (scroll so the heatmap or bars fill the screen) |
| `4-plan.png` | Study plan | Exam tab → NCLEX → Study plan |
| `5-ngn.png` | NGN bowtie item | Exam tab → NCLEX → NGN Case Practice → **Severe asthma exacerbation** → item 3 (bowtie). Fill a couple of boxes, don't submit |
| `6-visa.png` | Migration monitor | Visa tab (Canada: Express Entry draws) |
| `7-english.png` | OET writing task | Exam tab → OET & IELTS → OET Writing → Case notes (or Letter builder) |

AirDrop them to the Mac and drop them in `store-assets/raw/` with those names. Also take the Pro screen as
`store-assets/review/paywall.png` (Apple wants it for the subscription review).

## 3. Frame them

Tell Claude the files are in `raw/`, or run:

```
python3 store-assets/tools/frame.py store-assets/raw store-assets/framed node_modules/@expo-google-fonts/bricolage-grotesque/800ExtraBold/BricolageGrotesque_800ExtraBold.ttf node_modules/@expo-google-fonts/figtree/500Medium/Figtree_500Medium.ttf
```

Output in `store-assets/framed/`:
- `ios-6.9/` 1320 × 2868 → App Store Connect, 6.9" iPhone display
- `ios-6.5/` 1284 × 2778 → 6.5" iPhone display (optional: Apple scales the 6.9" set down if you skip it)
- `android/` 1080 × 1920 → Google Play, phone screenshots

## 4. Afterwards

Restore your own backup (step 1), or reset the app, and tap **Lock Pro again** on the Pro screen.
