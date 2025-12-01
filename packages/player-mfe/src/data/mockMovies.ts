/**
 * Mock data for movies
 * This data can be replaced with real API data later
 */

export interface Movie {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  year: number;
  rating: number;
  description?: string;
  videoUrl?: string;
  pexelsVideoId?: string;
  subtitles?: { language: string; label: string; url: string }[];
}

/**
 * Mock movies data
 */
export const mockMovies: Movie[] = [
  {
    id: "68fe440f0f375de5da710444",
    title: "John Wick 4",
    imageUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    category: "Acción",
    year: 2023,
    rating: 8.5,
    description: "John Wick libra una guerra total contra el Alto Consejo, enfrentando nuevos enemigos y alianzas en una batalla imparable.",
    pexelsVideoId: "action-movie-trailer",
    subtitles: [
      {
        language: "es",
        label: "Español",
        url: "https://res.cloudinary.com/dwmt0zy4j/raw/upload/v1761666896/John_Wick_4_2023_ggihbb_gq4qfc.vtt", // okay
      },
      {
        language: "en",
        label: "English",
        url: "https://res.cloudinary.com/dwmt0zy4j/raw/upload/v1761668206/John_Wick_4_2023_ggihbb_en_1_qnpule.vtt", // okay
      },
    ],
  },
  {
    id: "68fe6edc1f47ab544c72e3d5",
    title: "Batman",
    imageUrl: "https://i.ibb.co/rBZd4CY/imagen-2025-10-25-175217428.png",
    category: "Drama",
    year: 2023,
    rating: 7.8,
    description: "Batman investiga una red de corrupción en Gotham mientras se enfrenta a un enigmático asesino serial.",
    pexelsVideoId: "batman-drama-scene",
    subtitles: [
      {
        language: "es",
        label: "Español",
        url: "https://res.cloudinary.com/dwmt0zy4j/raw/upload/v1761671999/Batman_2__El_Caballero_De_La_Noche_2008_ccl3gx_e0gig8.vtt", // okay
      },
      {
        language: "en",
        label: "English",
        url: "https://res.cloudinary.com/dwmt0zy4j/raw/upload/v1761672271/Batman_2__El_Caballero_De_La_Noche_2008_ccl3gx_avwokv.vtt", // okay
      },
    ],
  },
  {
    id: "68fe73ef1f47ab544c72e3d8",
    title: "Demon Slayer",
    imageUrl: "https://i.ibb.co/4RGmBZzf/imagen-2025-10-25-172857480.png",
    category: "Anime",
    year: 2023,
    rating: 9.2,
    description: "Los cazadores de demonios son arrastrados al Castillo del Infinito para afrontar batallas definitivas contra demonios de alto rango.",
    pexelsVideoId: "anime-fight-scene",
    subtitles: [
      {
        language: "es",
        label: "Español",
        url: "https://res.cloudinary.com/dwmt0zy4j/raw/upload/v1761673455/Demon_Slayer_jiypse_es_pcj2nw.vtt", // okay
      },
      {
        language: "en",
        label: "English",
        url: "https://res.cloudinary.com/dwmt0zy4j/raw/upload/v1761662659/Demon_Slayer_jiypse_english_pxkvbu.vtt", // okay
      },
    ],
  },
  {
    id: "68fe76501f47ab544c72e3db",
    title: "K-Pop Demon Hunters",
    imageUrl: "/images/kpopdemonhunters.jpg",
    category: "Comedia",
    year: 2023,
    rating: 7.5,
    description: "Un grupo de idols K‑Pop dobla como cazadoras de demonios, equilibrando escenarios y peligros sobrenaturales.",
    pexelsVideoId: "kpop-dance-performance",
    subtitles: [
      {
        language: "es",
        label: "Español",
        url: "https://res.cloudinary.com/dwmt0zy4j/raw/upload/v1761660647/K-POP_demon_hunters_uuhmqa_espa%C3%B1ol_v9ts4z.vtt", // okay
      },
      {
        language: "en",
        label: "English",
        url: "https://res.cloudinary.com/dwmt0zy4j/raw/upload/v1761660074/K-POP_demon_hunters_uuhmqa_english_ak1wf8.vtt", // okay
      },
    ],
  },
  {
    id: "68fe776a1f47ab544c72e3dd",
    title: "Weapons",
    imageUrl: "/images/waapons.jpg",
    category: "Thriller",
    year: 2023,
    rating: 8.0,
    description: "Un thriller que entrelaza historias oscuras alrededor de un misterioso accidente y sus consecuencias.",
    pexelsVideoId: "thriller-suspense-scene",
    subtitles: [
      {
        language: "es",
        label: "Español",
        url: "https://res.cloudinary.com/dwmt0zy4j/raw/upload/v1761661638/Weapons_fri1p3_espa%C3%B1ol_exlkx2.vtt", // okay
      },
      {
        language: "en",
        label: "English",
        url: "https://res.cloudinary.com/dwmt0zy4j/raw/upload/v1761673023/Weapons_fri1p3_en_erxtfx.vtt", // okay
      },
    ],
  },
  {
    id: "68fe51230f375de5da710446",
    title: "Wicked",
    imageUrl: "https://i.ibb.co/BVsCYh27/imagen-2025-10-25-174605393.png",
    category: "Drama",
    year: 1989,
    rating: 8.9,
    description: "La historia no contada de las brujas de Oz, donde amistad y destino chocan en un mundo de magia.",
    pexelsVideoId: "magical-drama-scene",
    subtitles: [
      {
        language: "es",
        label: "Español",
        url: "https://res.cloudinary.com/dwmt0zy4j/raw/upload/v1761671836/Wicked_zzpbfm_es_wzvcyj.vtt", // okay
      },
      {
        language: "en",
        label: "English",
        url: "https://res.cloudinary.com/dwmt0zy4j/raw/upload/v1761662457/Wicked_zzpbfm_english_cdlico.vtt", // okay
      },
    ],
  },
  {
    id: "69002c492df6874aea86dc46",
    title: "Elio",
    imageUrl: "/images/eliomovie.jpg",
    category: "Suspense",
    year: 2023,
    rating: 7.2,
    description: "Elio es transportado accidentalmente a una asamblea intergaláctica y debe representar a la Tierra.",
    pexelsVideoId: "sci-fi-space-scene",
    subtitles: [
      {
        language: "es",
        label: "Español",
        url: "https://res.cloudinary.com/dwmt0zy4j/raw/upload/v1761661915/Elio___Disney_c8ilzy_espa%C3%B1ol_cwu8uo.vtt", // okay
      },
      {
        language: "en",
        label: "English",
        url: "https://res.cloudinary.com/dwmt0zy4j/raw/upload/v1761657717/Elio___Disney_c8ilzy_qmnms3.vtt", // okay
      },
    ],
  }
];