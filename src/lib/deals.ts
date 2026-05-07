import { clamp, round } from "@/lib/utils";
import { mockProducts } from "@/lib/mock-products";
import type { DataSource, Deal, RewardTier } from "@/types/deal";

type DummyProduct = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  category: string;
  images?: string[];
  thumbnail?: string | null;
};

const partnerShops = [
  "PulseCart",
  "Orbit Outlet",
  "MonoMart",
  "FlashRoom",
  "Stack Supply",
  "KiloDrop",
];

const familyShopMap = {
  tech: ["PulseCart", "NeonTech", "MonoMart"],
  sneaker: ["SneakerVault", "KiloDrop", "FlashRoom"],
  home: ["HomeHackz", "Stack Supply", "Orbit Outlet"],
  style: ["FlashRoom", "Orbit Outlet", "MonoMart"],
} as const;

const palettes = {
  tech: {
    primary: "#3AA7FF",
    secondary: "#D7FF57",
  },
  sneaker: {
    primary: "#FF7A18",
    secondary: "#D7FF57",
  },
  home: {
    primary: "#61D6FF",
    secondary: "#FF7A18",
  },
  style: {
    primary: "#A97CFF",
    secondary: "#3AA7FF",
  },
} as const;

export const rewardTiers: RewardTier[] = [
  {
    threshold: 25,
    title: "5% Sponsor Code",
    subtitle: "Prototype code for your next NeonTech checkout.",
    sponsor: "NeonTech",
    accent: "#D7FF57",
    glow: "#3AA7FF",
  },
  {
    threshold: 50,
    title: "Early Access Deal",
    subtitle: "Priority access to the next SneakerVault heat drop.",
    sponsor: "SneakerVault",
    accent: "#FF7A18",
    glow: "#D7FF57",
  },
  {
    threshold: 100,
    title: "Mystery Drop",
    subtitle: "A premium HomeHackz drop unlocks in pitch mode only.",
    sponsor: "HomeHackz",
    accent: "#3AA7FF",
    glow: "#FF7A18",
  },
];

export function calculateDealSignal(
  deal: Pick<Deal, "dealScore" | "popularity" | "views" | "discountPercent" | "rating">,
) {
  return (
    deal.dealScore * 12 +
    deal.popularity +
    Math.log10(deal.views) * 9 +
    deal.discountPercent * 0.4 +
    deal.rating * 3
  );
}

function hashString(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function seededNumber(seed: string, min: number, max: number) {
  const range = max - min + 1;
  return min + (hashString(seed) % range);
}

function pick<T>(seed: string, values: T[]) {
  return values[hashString(seed) % values.length];
}

function categoryFamily(category: string) {
  const value = category.toLowerCase();

  if (
    value.includes("shoe") ||
    value.includes("sneaker") ||
    value.includes("watch") ||
    value.includes("bag")
  ) {
    return "sneaker";
  }

  if (
    value.includes("home") ||
    value.includes("furniture") ||
    value.includes("kitchen")
  ) {
    return "home";
  }

  if (
    value.includes("sunglasses") ||
    value.includes("dress") ||
    value.includes("jewellery")
  ) {
    return "style";
  }

  return "tech";
}

function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildArtwork(title: string, category: string, primary: string, secondary: string) {
  const safeTitle = escapeXml(title);
  const safeCategory = escapeXml(titleCase(category));
  const initials = safeTitle
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1400">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primary}" stop-opacity="0.95" />
          <stop offset="100%" stop-color="${secondary}" stop-opacity="0.92" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1400" rx="88" fill="#06070D" />
      <circle cx="260" cy="260" r="220" fill="${secondary}" fill-opacity="0.26" />
      <circle cx="980" cy="1040" r="280" fill="${primary}" fill-opacity="0.28" />
      <rect x="88" y="94" width="1024" height="1212" rx="76" fill="url(#bg)" fill-opacity="0.18" stroke="rgba(255,255,255,0.2)" />
      <path d="M182 862C362 622 580 552 820 610C902 630 990 674 1040 730" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="18" stroke-linecap="round"/>
      <path d="M212 946C418 816 670 810 932 930" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="12" stroke-linecap="round"/>
      <text x="114" y="234" fill="#FFFFFF" font-size="188" font-family="Arial, sans-serif" font-weight="700">${initials}</text>
      <text x="114" y="1110" fill="#FFFFFF" font-size="64" font-family="Arial, sans-serif" font-weight="700">${safeTitle}</text>
      <text x="114" y="1188" fill="rgba(255,255,255,0.82)" font-size="34" font-family="Arial, sans-serif">${safeCategory}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildSummary(
  discountPercent: number,
  rating: number,
  stock: number,
  isSponsored: boolean,
  family: ReturnType<typeof categoryFamily>,
) {
  const scarcityLine =
    stock <= 18
      ? "Low stock makes the timing signal unusually sharp."
      : "Inventory is still healthy, so the value lead looks clean.";

  if (discountPercent >= 30 && rating >= 4.6) {
    return `Big discount plus strong product sentiment. ${scarcityLine}`;
  }

  if (family === "tech") {
    return `Tech value is strong here: price cut is real, trust is solid and the setup feels easy to justify.`;
  }

  if (family === "sneaker") {
    return `${isSponsored ? "Sponsored but still compelling:" : ""} wearable flex with a clean markdown and enough social heat to move fast.`;
  }

  if (family === "home") {
    return `Home upgrade energy with a visible price swing. ${scarcityLine}`;
  }

  return `High scroll-stop factor, social proof and a discount that lands fast in under two seconds.`;
}

function buildTag(discountPercent: number, popularity: number, stock: number) {
  if (discountPercent >= 32) {
    return "Deal exploding now";
  }

  if (stock <= 18) {
    return "Low stock pressure";
  }

  if (popularity >= 88) {
    return "People are saving this";
  }

  return "Price dipped minutes ago";
}

function buildHeatLevel(dealScore: number): Deal["heatLevel"] {
  if (dealScore >= 8.6) {
    return "wild";
  }

  if (dealScore >= 7.5) {
    return "hot";
  }

  return "warm";
}

function curatedProducts(products: DummyProduct[]) {
  const filtered = products.filter((product) => {
    const family = categoryFamily(product.category);
    return product.price >= 15 && ["tech", "sneaker", "home", "style"].includes(family);
  });

  return filtered.length >= 18 ? filtered.slice(0, 36) : products.slice(0, 24);
}

function mapProductsToDeals(products: DummyProduct[]): Deal[] {
  return curatedProducts(products)
    .map((product) => {
      const seed = `${product.id}-${product.title}`;
      const family = categoryFamily(product.category);
      const palette = palettes[family];
      const currentPrice = round(product.price, 2);
      const discountPercent = clamp(
        round(product.discountPercentage || seededNumber(seed, 14, 38), 1),
        12,
        68,
      );
      const oldPrice = round(currentPrice / (1 - discountPercent / 100), 2);
      const popularity = seededNumber(`${seed}-popularity`, 58, 99);
      const views = seededNumber(`${seed}-views`, 1600, 98000);
      const saves = seededNumber(`${seed}-saves`, 180, 9200);
      const timeDropMinutes = seededNumber(`${seed}-drop`, 2, 46);
      const rawSponsored = hashString(`${seed}-sponsor`) % 7 === 0;
      const sponsorLabel = rawSponsored
        ? family === "tech"
          ? "NeonTech"
          : family === "home"
            ? "HomeHackz"
            : "SneakerVault"
        : undefined;
      const shops = [...familyShopMap[family], ...partnerShops];
      const shop = sponsorLabel ?? pick(`${seed}-shop`, shops);
      const dealScore = clamp(
        round(
          discountPercent * 0.12 +
            product.rating * 1.08 +
            (product.stock <= 18 ? 1.1 : product.stock <= 36 ? 0.5 : 0) +
            (rawSponsored ? 0.2 : 0),
          1,
        ),
        0,
        10,
      );
      const tag = buildTag(discountPercent, popularity, product.stock);

      return {
        id: product.id,
        title: product.title,
        description: product.description,
        image: product.images?.[0] ?? product.thumbnail ?? null,
        artwork: buildArtwork(product.title, product.category, palette.primary, palette.secondary),
        currentPrice,
        oldPrice,
        discountPercent,
        rating: round(product.rating, 1),
        stock: product.stock,
        dealScore,
        category: titleCase(product.category),
        shop,
        isSponsored: rawSponsored,
        sponsorLabel,
        aiSummary: buildSummary(
          discountPercent,
          product.rating,
          product.stock,
          rawSponsored,
          family,
        ),
        saves,
        views,
        popularity,
        timeDropMinutes,
        tag,
        accentPrimary: palette.primary,
        accentSecondary: palette.secondary,
        heatLevel: buildHeatLevel(dealScore),
      } satisfies Deal;
    })
    .sort((left, right) => {
      const leftSignal = calculateDealSignal(left);
      const rightSignal = calculateDealSignal(right);

      return rightSignal - leftSignal;
    });
}

export async function getDeals(): Promise<{ deals: Deal[]; source: DataSource }> {
  try {
    const response = await fetch(
      "https://dummyjson.com/products?limit=80&select=id,title,description,price,discountPercentage,rating,stock,category,thumbnail,images",
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`DummyJSON returned ${response.status}`);
    }

    const payload = (await response.json()) as { products?: DummyProduct[] };

    if (!payload.products?.length) {
      throw new Error("DummyJSON returned no products");
    }

    return {
      deals: mapProductsToDeals(payload.products),
      source: "dummyjson",
    };
  } catch {
    return {
      deals: mapProductsToDeals(mockProducts),
      source: "mock",
    };
  }
}
