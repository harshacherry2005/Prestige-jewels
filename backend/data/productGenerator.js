// Programmatic Jewelry Generator
// Guarantees 1200 UNIQUE products: 100 per category × 12 categories.
// Every product has a unique _id, unique name, and distinct attribute mix.

const categories = [
  { name: 'Premium Necklaces',  collection: 'Premium',  metal: 'Gold',   baseWeight: 35,  weightStep: 1.0,  sizeType: 'neck'    },
  { name: 'Premium Chains',     collection: 'Premium',  metal: 'Gold',   baseWeight: 18,  weightStep: 0.5,  sizeType: 'chain'   },
  { name: 'Premium Bangles',    collection: 'Premium',  metal: 'Gold',   baseWeight: 24,  weightStep: 0.7,  sizeType: 'bangle'  },
  { name: 'Premium Rings',      collection: 'Premium',  metal: 'Gold',   baseWeight: 4.5, weightStep: 0.15, sizeType: 'ring'    },
  { name: 'Premium Earrings',   collection: 'Premium',  metal: 'Gold',   baseWeight: 6.2, weightStep: 0.2,  sizeType: 'ear'     },
  { name: 'Premium Bridal Sets',collection: 'Premium',  metal: 'Gold',   baseWeight: 68,  weightStep: 1.5,  sizeType: 'bridal'  },
  { name: 'Chains',             collection: 'Ordinary', metal: 'Silver', baseWeight: 4.5, weightStep: 0.12, sizeType: 'chain'   },
  { name: 'Bangles',            collection: 'Ordinary', metal: 'Silver', baseWeight: 8.5, weightStep: 0.2,  sizeType: 'bangle'  },
  { name: 'Rings',              collection: 'Ordinary', metal: 'Silver', baseWeight: 2.2, weightStep: 0.08, sizeType: 'ring'    },
  { name: 'Earrings',           collection: 'Ordinary', metal: 'Silver', baseWeight: 2.8, weightStep: 0.1,  sizeType: 'ear'     },
  { name: 'Pendants',           collection: 'Ordinary', metal: 'Silver', baseWeight: 3.2, weightStep: 0.1,  sizeType: 'pendant' },
  { name: 'Anklets',            collection: 'Ordinary', metal: 'Silver', baseWeight: 5.0, weightStep: 0.15, sizeType: 'anklet'  },
];

// 25 unique adjectives × 20 unique style nouns = 500 unique combos → more than enough for 100/category
const adjectives = [
  'Royal', 'Aura', 'Celestial', 'Gilded', 'Imperial', 'Ethereal', 'Sovereign', 'Opulent', 'Radiant', 'Timeless',
  'Velvet', 'Midnight', 'Aurora', 'Elysian', 'Zenith', 'Luminary', 'Majestic', 'Heritage', 'Seraphic', 'Pristine',
  'Ivory', 'Dorado', 'Solas', 'Regal', 'Eternal'
];

const styles = [
  'Solitaire', 'Filigree', 'Marquise', 'Milgrain', 'Halo', 'Pave', 'Cluster', 'Vintage', 'Art Deco', 'Lattice',
  'Rope Twist', 'Infinity', 'Crescent', 'Blossom', 'Byzantine', 'Chevron', 'Bezel Set', 'Trellis', 'Mosaic', 'Cascade'
];

const premiumPurities = ['22K Gold', '18K Gold', '24K Gold', 'Platinum 950', '22K Gold', '18K Gold'];
const ordinaryPurities = ['925 Silver', '14K Gold', '925 Silver', '14K Gold', '925 Silver', '14K Gold'];

const premiumStones = [
  'VVS1 Certified Diamond (0.50 ct)',
  'Natural Emerald – Zambian (1.20 ct)',
  'Royal Blue Sapphire – Ceylon (0.80 ct)',
  'AAA Burmese Ruby (1.50 ct)',
  'South Sea Cultured Pearl (9 mm)',
  'None – Pure Metal (Hallmarked)',
  'VVS2 Marquise Diamond (0.75 ct)',
  'Natural Pink Tourmaline (1.10 ct)',
  'Alexandrite Cat\'s Eye (0.65 ct)',
  'Paraiba Tourmaline (0.45 ct)',
];

const ordinaryStones = [
  'Premium Cubic Zirconia (AAA Grade)',
  'Swarovski Crystal Accents',
  'None – High-Shine Sterling Silver',
  'Polished Onyx Accent',
  'Synthetic Turquoise Inlay',
  'Opalite Moonstone Effect',
  'Blue Topaz (lab-created, 0.3 ct)',
  'Garnet Red CZ (0.25 ct)',
];

const imgMap = {
  neck:    ['photo-1599643478518-a784e5dc4c8f', 'photo-1611591437281-460bfbe1220a', 'photo-1573408301185-9519bf49e9c5'],
  chain:   ['photo-1599643477877-530eb83abc8e', 'photo-1602751584552-8ba73aad10e1', 'photo-1515562141207-7a88fb7ce338'],
  bangle:  ['photo-1611591437281-460bfbe1220a', 'photo-1515562141207-7a88fb7ce338', 'photo-1535632066927-ab7c9ab60908'],
  ring:    ['photo-1605100804763-247f67b3557e', 'photo-1603561591411-07134e71a2a9', 'photo-1598560917505-59a3ad559071'],
  ear:     ['photo-1635767798638-3e25273a8236', 'photo-1535632066927-ab7c9ab60908', 'photo-1573408301185-9519bf49e9c5'],
  bridal:  ['photo-1599643478518-a784e5dc4c8f', 'photo-1611591437281-460bfbe1220a', 'photo-1598560917505-59a3ad559071'],
  pendant: ['photo-1599643477877-530eb83abc8e', 'photo-1599643478518-a784e5dc4c8f', 'photo-1602751584552-8ba73aad10e1'],
  anklet:  ['photo-1515562141207-7a88fb7ce338', 'photo-1602751584552-8ba73aad10e1', 'photo-1535632066927-ab7c9ab60908'],
};

const buildImgUrl = (photoId) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=600&q=80`;

const getSizes = (sizeType) => {
  switch (sizeType) {
    case 'ring':   return ['5', '6', '7', '8', '9'];
    case 'bangle': return ['2.4', '2.6', '2.8'];
    case 'chain':  return ['16 inch', '18 inch', '20 inch', '22 inch'];
    case 'neck':
    case 'bridal': return ['Standard', 'Adjustable'];
    default:       return ['Standard'];
  }
};

const reviewers = [
  ['Ananya', 'Priya', 'Deepa', 'Kavya', 'Sneha', 'Divya', 'Nisha', 'Rekha', 'Pooja', 'Asha'],
  ['Shah', 'Mehta', 'Gupta', 'Patel', 'Sharma', 'Verma', 'Singh', 'Joshi', 'Rao', 'Nair'],
];

const generateProducts = () => {
  const generated = [];
  // Deduplicate guard: track all names we've used
  const usedNames = new Set();

  let globalId = 1;

  for (let catIdx = 0; catIdx < categories.length; catIdx++) {
    const cat = categories[catIdx];
    const purities = cat.collection === 'Premium' ? premiumPurities : ordinaryPurities;
    const stones   = cat.collection === 'Premium' ? premiumStones   : ordinaryStones;
    const imgs     = imgMap[cat.sizeType] || imgMap.chain;
    const catBase  = cat.name.replace('Premium ', ''); // e.g. "Necklaces"
    // Singular form for natural language: "Necklaces" → "Necklace"
    const catSingular = catBase.endsWith('s') ? catBase.slice(0, -1) : catBase;

    let productIdx = 0; // 0..99 per category

    for (let adjIdx = 0; adjIdx < adjectives.length; adjIdx++) {
      for (let styIdx = 0; styIdx < styles.length; styIdx++) {
        if (productIdx >= 100) break;

        const adj   = adjectives[adjIdx];
        const style = styles[styIdx];

        // Unique product name: "Royal Filigree Necklace" — guaranteed unique per category
        // Across categories it stays unique because catSingular differs.
        const name = `${adj} ${style} ${catSingular}`;

        // Guard against any cross-generator collision
        if (usedNames.has(name)) continue;
        usedNames.add(name);

        const purity     = purities[productIdx % purities.length];
        const metalType  = purity.includes('Gold') ? 'Gold' : purity.includes('Silver') ? 'Silver' : 'Platinum';
        const stone      = stones[productIdx % stones.length];
        const weight     = parseFloat((cat.baseWeight + productIdx * cat.weightStep).toFixed(2));
        const imgUrl     = buildImgUrl(imgs[productIdx % imgs.length]);

        // Making charge increases with product index for variety
        const makingCharge = cat.collection === 'Premium'
          ? 1500 + (productIdx % 10) * 700
          : 150  + (productIdx % 10) * 80;

        // Discount: every 7th item 15%, every 5th 10%, every 3rd 5%, rest 0
        const discountPercent = productIdx % 7 === 0 ? 15
                              : productIdx % 5 === 0 ? 10
                              : productIdx % 3 === 0 ? 5
                              : 0;

        const inventory = 3 + (productIdx % 14);
        const rating    = parseFloat((4.0 + (productIdx % 10) * 0.1).toFixed(1));

        const numReviews = productIdx % 3; // 0, 1, or 2 reviews
        const reviews = [];
        for (let r = 0; r < numReviews; r++) {
          reviews.push({
            customerName: `${reviewers[0][(globalId + r) % 10]} ${reviewers[1][(globalId * 2 + r) % 10]}`,
            rating: 4 + (r % 2),
            text: `Beautiful ${catSingular.toLowerCase()}. The ${purity} finish is impeccable and hallmark verified.`,
            date: new Date(Date.now() - (r + 1) * 8 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }

        generated.push({
          _id: `vprod_${String(globalId).padStart(4, '0')}`,
          name,
          description: `Exquisitely hand-crafted ${purity} ${catSingular.toLowerCase()} weighing ${weight}g. ` +
                       `Stone: ${stone}. ` +
                       `${cat.collection === 'Premium' ? 'BIS Hallmark & IGI certified.' : 'BIS Hallmarked. Perfect everyday wear.'}`,
          images: [imgUrl],
          category: cat.name,
          collectionType: cat.collection,
          metalType,
          purity,
          weight,
          stoneDetails: stone,
          sizes: getSizes(cat.sizeType),
          basePrice: cat.collection === 'Premium' ? 0 : 800 + productIdx * 220,
          makingCharge,
          isPriceDynamic: true,
          discountPercent,
          gstPercent: 3,
          inventory,
          rating,
          reviewsCount: reviews.length,
          reviews,
        });

        globalId++;
        productIdx++;
      }
      if (productIdx >= 100) break;
    }
  }

  // Final deduplication safety net — remove any products sharing the same name
  const seen = new Set();
  const deduplicated = generated.filter(p => {
    if (seen.has(p.name)) return false;
    seen.add(p.name);
    return true;
  });

  if (deduplicated.length !== generated.length) {
    console.warn(`⚠️  Removed ${generated.length - deduplicated.length} duplicate product(s).`);
  }

  return deduplicated;
};

module.exports = { generateProducts };
