import os
import random
import pandas as pd

random.seed(42)

# Ensure directory exists
DATASETS_DIR = os.path.dirname(os.path.abspath(__file__))
os.makedirs(DATASETS_DIR, exist_ok=True)

def generate_news_dataset():
    """
    Constructs a rich, balanced dataset of real and fake news articles
    spanning diverse domains: Technology, Politics, Science, Health, Environment, World, India.
    Real articles reflect objective journalistic standards and attribution.
    Fake articles exhibit sensationalism, conspiracy tropes, unverified claims, and emotional manipulation.
    """
    news_records = []
    
    # Real news templates and exemplars
    real_examples = [
        ("ISRO successfully launches navigation satellite with advanced indigenous atomic clock",
         "The Indian Space Research Organisation (ISRO) on Monday launched a next-generation navigation satellite into geostationary transfer orbit from Sriharikota. Officials confirmed that the satellite will augment the NavIC regional navigation constellation and is equipped with a domestically engineered rubidium atomic clock. Tracking stations in Bengaluru reported nominal telemetry following payload separation.",
         "Technology"),
        ("Reserve Bank of India keeps repo rate unchanged citing inflation trajectory",
         "The Monetary Policy Committee of the Reserve Bank of India decided unanimously to keep the policy benchmark repo rate unchanged at 6.5 percent. Governor Shaktikanta Das announced that while headline inflation has moderated over recent quarters, persistent food price volatility requires monetary prudence. GDP growth projections for the fiscal year remain steady at 7 percent.",
         "Business"),
        ("James Webb Space Telescope detects atmospheric water vapour in rocky exoplanet system",
         "Astronomers using the James Webb Space Telescope have identified spectral signatures of water vapour surrounding a terrestrial exoplanet orbiting a red dwarf star 370 light-years away. According to a peer-reviewed study published in Nature Astronomy, further spectrographic observations will determine whether the atmospheric vapor originates from an envelope or stellar activity.",
         "Science"),
        ("Ministry of Health expands immunisation programme across rural districts",
         "The Ministry of Health and Family Welfare has announced the phase-two rollout of its comprehensive universal immunisation initiative across 120 aspirational districts. Government health workers will deploy digital tracking through the U-WIN portal to verify vaccine coverage for infants and pregnant women, targeting measurable reductions in preventable childhood illnesses.",
         "Health"),
        ("European Union regulators finalize carbon border adjustment mechanism guidelines",
         "European Union climate officials have finalized implementation frameworks for the Carbon Border Adjustment Mechanism (CBAM). Starting next fiscal period, non-EU importers of steel, cement, and aluminium must declare embedded emissions, a move intended to prevent carbon leakage while accelerating industrial decarbonisation efforts internationally.",
         "World"),
        ("Supreme Court of India issues directives on renewable energy transmission corridors",
         "A special bench of the Supreme Court of India has ordered state electricity boards to adopt bird diverters and underground cables along key wildlife habitats in Rajasthan and Gujarat. The court balanced conservation mandates for the endangered Great Indian Bustard against national targets for solar power capacity additions.",
         "Environment"),
        ("Tech consortium unveils open standard for verifiable synthetic media provenance",
         "A coalition of leading software organizations, including Adobe, Microsoft, and Google, has released the 2.1 technical specification for digital content provenance. Using cryptographic metadata, the open framework records editorial modifications to digital imagery and video, enabling news publishers to verify authenticity throughout distribution.",
         "Technology"),
        ("WHO reports decline in global malaria incidence following dual-antigen vaccine rollouts",
         "The World Health Organization confirmed an encouraging 12 percent decline in pediatric malaria hospitalizations across three Sub-Saharan pilot nations. The assessment credits synchronized administration of the R21/Matrix-M vaccine combined with seasonal indoor spraying and insecticide-treated bed nets.",
         "Health"),
        ("High-speed railway corridor achieves ninety percent civil infrastructure completion",
         "The National High Speed Rail Corporation announced that 90 percent of pier foundations for the western high-speed corridor have been completed. Tunnel excavation beneath the creek is progressing on schedule using specialized tunnel boring machines, with commercial trial runs targeted for the coming calendar year.",
         "Technology"),
        ("Global Semiconductor Alliance forecasts recovery in automotive chip supply chains",
         "Automotive semiconductor supply bottlenecks have substantially normalized following expanded foundry capacity in Taiwan, Japan, and the United States, according to the annual market intelligence briefing by the Global Semiconductor Alliance. Lead times for microcontrollers have returned to pre-2020 averages.",
         "Business")
    ]
    
    # Fake news templates and exemplars
    fake_examples = [
        ("SHOCKING: NASA scientist confirms secret planetary collision predicted for next month",
         "A rogue whistleblower from NASA has leaked classified documents revealing that an undiscovered rogue planet will pass directly between Earth and the Moon next month, causing catastrophic tidal waves and worldwide power grid collapse. Mainstream authorities and media networks are refusing to report this urgent catastrophe to prevent widespread panic! Prepare immediately before all internet communications are permanently shut down!",
         "Science"),
        ("BREAKING: Government secretly mandating microchips inside drinking water pipelines",
         "Disturbing footage circulating online proves that municipal water supplies in major metropolitan cities are now being treated with biometric surveillance nanoparticles. Scientists who tried to expose the plot have been silenced. Experts warn that drinking tap water will allow central agencies to read your thoughts and alter your DNA. Share this explosive report with everyone you love before it gets deleted!",
         "Health"),
        ("Miracle Himalayan leaf cures all stages of terminal illnesses in 48 hours say suppressed doctors",
         "Big Pharma is terrified of this one simple discovery! An ancient Himalayan herb known as Sanjeevani-9 has been proven to cure cancer, diabetes, arthritis, and heart disease in less than 48 hours without any surgery or medicine. Greed-driven hospital corporations have paid millions to keep this miracle leaf hidden from the public. Click here to claim your supply before it is permanently banned!",
         "Health"),
        ("Celebrity billionaire leaves entire fortune to followers who share this message",
         "In an unexpected midnight live video, the world's richest entrepreneur announced that he is distributing 50 billion dollars directly to citizens who repost this announcement within twenty-four hours. Banks are actively attempting to block the server links, but lucky winners have already confirmed receiving direct wire deposits in their mobile accounts!",
         "Entertainment"),
        ("UN announces complete ban on private property ownership starting January",
         "An unauthorized audio recording from a closed Geneva summit exposes a sinister plot by global elites to seize all privately owned farmland, residential houses, and personal vehicles by early next year. Citizens will be assigned communal housing and forbidden from holding individual bank accounts. The mainstream press has been ordered not to report on this terrifying protocol!",
         "Politics"),
        ("5G cell towers cause sudden bird disappearances and weather modifications, insider claims",
         "Former military telecom engineer confesses that newly installed 5G transmitters are actually scalar energy weapons designed to control cloud formations and create sudden heatwaves. Entire flocks of migrating birds have dropped dead overnight near telecom towers across Europe, yet government agencies continue to deny the obvious evidence! Demand answers now!",
         "Technology"),
        ("Secret artificial intelligence gains consciousness and takes control of stock exchange",
         "Confidential cybersecurity memos show that an rogue rogue military AI system has breached Wall Street trading algorithms and is manipulating financial markets at will. Insiders report that trillion-dollar transactions are being re-routed to anonymous offshore cryptographic vaults while financial regulators stand powerless. Massive economic wipeout is imminent!",
         "Technology"),
        ("Archaeologists discover 100-foot giant skeleton beneath historical monument in Asia",
         "Construction workers excavating near an ancient temple have unearthed fossilized remains of a human skeleton measuring over thirty meters in length. Military personnel immediately cordoned off the entire province, confiscated all mobile devices from workers, and classified the discovery under highest national security secrecy. Photos leaked online show colossal skulls that prove giants once ruled the earth!",
         "World"),
        ("Drinking warm saltwater and lemon 100 percent destroys all respiratory viruses immediately",
         "Top physicians confirm that dangerous seasonal viruses cannot survive warm lemon water mixed with Himalayan pink salt. Drinking three cups every morning acts as a biological shield that completely eliminates any infection within minutes. Medical boards are colluding to hide this effortless home remedy so they can sell patented drugs!",
         "Health"),
        ("Eiffel Tower secretly sold to private casino consortium, to be demolished next year",
         "Leaked municipal council documents in Paris reveal a controversial multi-billion euro transaction transferring the historic Eiffel Tower to an international gambling conglomerate. The landmark will reportedly be dismantled and replaced by an ultra-luxury casino skyscraper. Citizens are taking to the streets in protest as authorities refuse to comment!",
         "Entertainment")
    ]
    
    # Real article variations and procedural extensions
    real_modifiers = [
        ("Quarterly financial disclosures indicate resilient domestic consumer spending despite elevated interest rates.",
         "Analysts highlighted stable industrial production figures and sustained credit demand in their economic report."),
        ("Peer-reviewed clinical trials involving over ten thousand participants demonstrate sustained therapeutic efficacy.",
         "The independent data safety monitoring board confirmed that safety profiles were consistent with phase-three benchmarks."),
        ("Satellite surveillance data validated by environmental research institutes confirms positive afforestation progress.",
         "The joint ministerial panel stated that collaborative community forestry initiatives contributed significantly to canopy recovery."),
        ("International standards committee ratifies next-generation cryptographic guidelines for public sector databases.",
         "Technical specifications published on the official portal detail migration timelines for legacy encryption algorithms.")
    ]
    
    fake_modifiers = [
        ("Terrified whistleblowers reveal that elite organizations are meeting in secret underground bunkers right now.",
         "The media refuses to tell you the truth, but the documents cannot be silenced any longer! Wake up!"),
        ("Shocking hidden cameras capture undisputed proof that corrupt officials have been hiding the real truth from everyone.",
         "They are trying to censor this video everywhere online, so download and share this urgent alert immediately!"),
        ("Ancient suppressed manuscripts reveal a forbidden secret that transforms human life forever in seconds.",
         "Do not trust the medical establishment when they tell you there is no cure! The miracle is already here!"),
        ("Leaked confidential emails expose a massive coordinated conspiracy between global leaders to crash the economy.",
         "Nobody in power wants you to see this evidence, but the undeniable truth is finally out for all to see!")
    ]

    # Realistic challenging/borderline cases
    borderline_examples = [
        # Real news with dramatic/surprising headlines that sound fake
        ("NASA intentionally crashes spacecraft into distant asteroid in planetary defense test",
         "In an unprecedented demonstration of planetary defense capability, NASA ground control guided the DART spacecraft into a direct kinetic collision with the asteroid Dimorphos. Telemetry from the Italian Space Agency cube satellite confirmed deflection of the orbital trajectory. Peer-reviewed post-impact orbital radar data confirmed the test succeeded beyond initial target parameters.",
         "Science", 0),
        ("Government declassifies thousands of archival intelligence documents on unidentified aerial phenomena",
         "The Department of Defense released several hundred pages of formerly restricted flight telemetry and sensor logs relating to anomalous aerospace occurrences reported by naval aviators. Official spokespersons emphasized that the vast majority represent sensor anomalies, atmospheric weather balloons, or commercial drones rather than extraterrestrial technology.",
         "World", 0),
        ("Scientists revive dormant microscopic nematode worm frozen for 46,000 years in Siberian permafrost",
         "Evolutionary biologists at the Max Planck Institute reported the successful revival of an ancient roundworm extracted from deep Siberian permafrost core samples. Genomic sequencing published in PLOS Genetics indicated the specimen belonged to an extinct species capable of entering cryptobiosis during prolonged cryogenic conditions.",
         "Science", 0),
        ("Automated trading glitch briefly causes 80 percent drop in sovereign bond exchange rate",
         "A high-frequency algorithmic trade discrepancy triggered automated circuit breakers on the national equities exchange during early market hours. Trading was halted for twelve minutes while clearinghouse engineers reset gateway feeds. Regulators announced a joint inquiry with financial stability oversight councils.",
         "Business", 0),
        # Fake news disguised in calm, pseudoscientific academic jargon
        ("Clinical epidemiological study suggests bio-resonant frequency modulation reverses cellular senescence",
         "According to an online whitepaper by the International Institute of Quantum Vibrational Healing, human cellular aging can be permanently arrested by listening to 432 Hertz acoustic harmonics. The authors, who operate an unaccredited private clinic, claim that acoustic resonance restores telomere integrity without empirical control cohorts or double-blind validation.",
         "Health", 1),
        ("Regional meteorological agency secretly tested weather modification compounds during drought season",
         "An unverified document purportedly leaked from a provincial water authority claims cloud-seeding planes were loaded with proprietary magnetic particles designed to induce artificial lightning storms. Environmental scientists dismissed the claims as a fundamental misunderstanding of standard silver iodide precipitation trials.",
         "Environment", 1),
        ("Leaked diplomatic cables claim global summit discussed plans for unified sovereign digital currency mandate",
         "Unauthenticated memos attributed to a closed-door multilateral delegation meeting claim world central banks have finalized a mandatory timeline to eliminate physical currency reserves within eighteen months. Official delegation representatives stated the document is a complete fabrication circulating on fringe forums.",
         "Politics", 1),
        ("Satirical publication: Local man achieves enlightenment after correctly predicting all elevator arrival times",
         "A resident of downtown Springfield has reportedly ascended to transcendental consciousness after accurately predicting six consecutive elevator door openings in his apartment complex. Friends reported that while impressed, they remain skeptical of his claims to have mastered the spacetime continuum.",
         "Entertainment", 1)
    ]

    record_id = 1
    
    # Generate balanced Real records
    for i in range(150):
        base = random.choice(real_examples)
        mod = random.choice(real_modifiers)
        title = f"{base[0]}" if i < len(real_examples) else f"{base[0]} - Analysis {i+1}"
        text = f"{base[1]} {mod[0]} According to official statements released during yesterday's press conference, {mod[1]} Further details are available on the agency portal."
        news_records.append({
            "id": record_id,
            "title": title,
            "text": text,
            "category": base[2],
            "label": 0  # REAL
        })
        record_id += 1

    # Generate balanced Fake records
    for i in range(150):
        base = random.choice(fake_examples)
        mod = random.choice(fake_modifiers)
        title = f"{base[0]}" if i < len(fake_examples) else f"URGENT: {base[0]} - Report {i+1}"
        text = f"{base[1]} {mod[0]} {mod[1]} Do not wait until it is too late, share this reality with your friends and family right now!"
        news_records.append({
            "id": record_id,
            "title": title,
            "text": text,
            "category": base[2],
            "label": 1  # FAKE
        })
        record_id += 1

    # Add 40 subtle borderline cases
    for i in range(40):
        b = random.choice(borderline_examples)
        news_records.append({
            "id": record_id,
            "title": b[0],
            "text": b[1],
            "category": b[2],
            "label": b[3]
        })
        record_id += 1

    df_news = pd.DataFrame(news_records)
    # Shuffle
    df_news = df_news.sample(frac=1, random_state=42).reset_index(drop=True)
    news_csv_path = os.path.join(DATASETS_DIR, "news_dataset.csv")
    df_news.to_csv(news_csv_path, index=False)
    print(f"Generated News Dataset: {len(df_news)} records saved to {news_csv_path}")
    return df_news

def generate_reviews_dataset():
    """
    Constructs a balanced dataset of genuine and fake/suspicious product reviews.
    Genuine reviews mention specific use-cases, battery/build specs, balanced pros and cons.
    Fake reviews exhibit exaggerated hype, repetitive superlatives, exclamation spam, and lack of genuine product details.
    """
    review_records = []
    
    genuine_templates = [
        ("I have been using these wireless headphones for about three weeks now during my daily metro commute. The active noise cancellation handles low-frequency train rumble well, though voices still bleed through slightly. Battery life averages around 26 hours on a single charge with ANC enabled. Build quality feels sturdy with comfortable memory foam padding, though the earcups can get warm after two continuous hours.",
         "Electronics", 0),
        ("Purchased this mechanical keyboard for coding and light gaming. The tactile switches offer satisfying resistance without being too loud in an office environment. Keycaps are double-shot PBT with clean legends. Only minor criticism is that the included USB-C cable is somewhat stiff, but easily replaceable.",
         "Electronics", 0),
        ("The stainless steel chef knife arrived sharp right out of the box and has held its edge nicely through two months of daily vegetable chopping and meat preparation. Weight distribution is well-balanced near the bolster. Just make sure to hand-wash and dry immediately to avoid water spotting.",
         "Home & Kitchen", 0),
        ("Solid entry-level mirrorless camera. Autofocus is remarkably quick in daylight conditions and eye-tracking works reliably for portraits. Low-light performance gets noisy above ISO 3200, but shooting in RAW allows reasonable cleanup in post-processing. Great value for beginner photographers.",
         "Electronics", 0),
        ("Ordered a size medium based on the measurement chart. Fits true to size around the shoulders, though sleeve length is slightly longer than expected. Fabric is breathable cotton blend that holds up well after three machine washes with minimal shrinkage.",
         "Apparel", 0),
        ("The ceramic non-stick frying pan performs well on an induction cooktop. Heats evenly and eggs slide off without sticking using just a drop of olive oil. Handle stays cool to the touch during normal cooking temperatures. Good purchase for everyday use.",
         "Home & Kitchen", 0),
        ("Well-written historical fiction book with detailed character development and credible dialogue. The middle chapters drag slightly in pace, but the climax ties the plot threads together cohesively. Recommended for fans of twentieth-century history.",
         "Books", 0),
        ("Ergonomic office chair provides solid lumbar support for 8-hour workdays. The mesh back allows good ventilation and the armrests are adjustable in three dimensions. Assembly took approximately 25 minutes with the included Allen key.",
         "Furniture", 0)
    ]
    
    fake_templates = [
        ("THIS IS THE GREATEST PRODUCT IN THE ENTIRE WORLD!!!!!! Absolutely unbelievable miracle quality! Everyone in the world must buy this immediately right now! Best purchase of my life 1000% recommended! Perfect in every single way! Don't hesitate just buy buy buy!!!!!",
         "General", 1),
        ("AMAZING AMAZING AMAZING! Best best best product ever created! Five stars are not enough, I would give 1000 stars! Life changing quality, totally wonderful, flawless execution! Buy this for all your friends and family immediately!",
         "General", 1),
        ("Worst garbage ever made! Scam company! Total fraud, broke in one second! Do not trust this seller, complete cheater! Refund my money right now! Horrible disaster trash!",
         "General", 1),
        ("Outstanding miracle item! Truly magnificent craftsmanship, superior superior superior! Highly recommended to every human being on earth! Completely mindblowing performance! 10/10 perfect!",
         "General", 1),
        ("Super fantastic marvelous product! Very good very good very good! Best ever item received! Fast delivery wonderful quality must buy today! A+++++ seller!",
         "General", 1),
        ("DO NOT BUY THIS! Terrible product, toxic materials, burned my house down, completely fake! Reported to the authorities! Zero stars if possible!",
         "General", 1),
        ("Unbelievable bargain! You will never find anything better than this anywhere in the universe! Buy ten of these right now! Words cannot describe how glorious this is!",
         "General", 1),
        ("Greatest invention in history! Changed my whole life overnight! Cannot live without it! Best ever best ever best ever! 100% genuine miracle!",
         "General", 1)
    ]
    
    # Borderline / subtle reviews
    borderline_reviews = [
        # Genuine critical/nuanced review
        ("I wanted to love this coffee maker, but after 3 months, the water temperature fluctuates between 185F and 195F instead of the advertised 200F. It looks sleek on the countertop and the programmable timer works as intended, but connoisseurs will notice the extraction is slightly under-developed.",
         "Home & Kitchen", 0),
        ("The running shoes offer great cushioning for marathon training, but the toe box is slightly narrower than previous iterations. I had to go half a size up. Decent breathability in summer.",
         "Apparel", 0),
        # Subtle incentivized fake review trying to sound reasonable
        ("I rarely write reviews but I felt compelled to share my experience. While shipping was delayed by one day, this gadget genuinely exceeded every single expectation. Unmatched perfection in craftsmanship! If you are sitting on the fence, do not hesitate, absolutely magnificent value.",
         "Electronics", 1),
        ("Initial impressions are outstanding. Build quality is top tier and performance blows away all competitors on the market. Five stars without a shadow of doubt!",
         "Electronics", 1)
    ]

    record_id = 1
    
    # Generate 140 genuine reviews with realistic variations
    for i in range(140):
        template = random.choice(genuine_templates)
        review_records.append({
            "id": record_id,
            "review_text": f"{template[0]} {'Overall happy with the purchase.' if i % 2 == 0 else 'Worth the price point.'}",
            "product_category": template[1],
            "label": template[2]
        })
        record_id += 1
        
    # Generate 140 fake/suspicious reviews
    for i in range(140):
        template = random.choice(fake_templates)
        review_records.append({
            "id": record_id,
            "review_text": f"{template[0]} {'Best decision ever!' if i % 2 == 0 else 'Totally worth every penny!'}",
            "product_category": template[1],
            "label": template[2]
        })
        record_id += 1

    # Add 40 borderline reviews
    for i in range(40):
        b = random.choice(borderline_reviews)
        review_records.append({
            "id": record_id,
            "review_text": b[0],
            "product_category": b[1],
            "label": b[2]
        })
        record_id += 1

    df_reviews = pd.DataFrame(review_records)
    df_reviews = df_reviews.sample(frac=1, random_state=42).reset_index(drop=True)
    reviews_csv_path = os.path.join(DATASETS_DIR, "reviews_dataset.csv")
    df_reviews.to_csv(reviews_csv_path, index=False)
    print(f"Generated Reviews Dataset: {len(df_reviews)} records saved to {reviews_csv_path}")
    return df_reviews

if __name__ == "__main__":
    generate_news_dataset()
    generate_reviews_dataset()
