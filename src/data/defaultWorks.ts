import { LiteraryWork } from '../types';

export const DEFAULT_WORKS: LiteraryWork[] = [
  {
    id: 'book-the-quiet-cartographer',
    type: 'book',
    title: 'The Quiet Cartographer',
    subtitle: 'Chronicles of Forgotten Coastlines and Silent Groves',
    author: 'Elena Vance',
    about: 'Written during the early autumn mist of 1924, this volume gathers notes, reflections, and hand-sketched boundaries of coastal harbors before the great lighthouse towers were built.',
    dedication: 'For those who listen to the sea before daybreak, and measure distance not by leagues, but by stillness.',
    genre: 'Literary Travelogue & Reflection',
    year: '1924',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000,
    chapters: [
      {
        id: 'c1',
        title: 'Prologue: The Morning Paper Tide',
        subtitle: 'Of ink, cedar desks, and salt air',
        content: `Every voyage begins before the lamps are extinguished. When the harbor bells strike five, the town is neither asleep nor awake, but held in that pale green wash of morning air which painters try all their lives to catch and seldom do.

I sat with my journal open, the edges yellowed like dried marsh grass. The fishermen were already untying their skiffs beneath the seawall. Their voices rose in brief, hushed syllables—the language of men who know that unnecessary sound disturbs the dawn water.

On my table lay the morning paper, still smelling faintly of river barge pine and damp newsprint. Between its headlines of railway charters and autumn wheat prices, I slipped my compass brass. We were mapping no continents today; only the narrow inlet where the Silent Grove touches the shore.`
      },
      {
        id: 'c2',
        title: 'Chapter I: The Blue Monolith',
        subtitle: 'Where the cliffs meet the grey current',
        content: `Three miles past the harbor breakwater stands the tall slate promontory the sailors call the Blue Monolith. From a distance it looks like a solitary sentinel left behind by an ancient geological architecture.

Up close, however, one sees the wild clover clinging to its fractures, and the white gulls that nest in its upper crevices. Here the Atlantic does not break violently; it rolls in deep, respirating swells that echo inside the submerged caves like the breathing of a sleeping leviathan.

To chart such a stone is to understand patience. One cannot simply take its coordinates and depart. One must watch how the shadow falls across the water at noon, how the tide drowns its base at sunset, and how in the moonlight it turns the color of cooled steel.`
      },
      {
        id: 'c3',
        title: 'Chapter II: The Sanctuary of Leaves',
        subtitle: 'An inventory of quiet hours',
        content: `Beyond the cliffs lies the inland forest. Here the air cools noticeably, filtered through centuries of hemlock and silver birch. The ground is cushioned with decades of fallen needles, deadening every footstep until one walks without sound.

In such silence, one’s thoughts cease their anxious hurry. The questions that seemed urgent in the city unravel like frayed cordage. What remains is simply the sound of wind in the high canopy, and the certainty that some things are best left unhurried.`
      }
    ]
  },
  {
    id: 'poem-dawn-over-silent-grove',
    type: 'poem',
    title: 'Dawn Over the Silent Grove',
    poet: 'Kaelen R. Moss',
    about: 'Composed after walking along the damp moss pathways of the eastern ridge at first light, meditating on stillness, breath, and the morning sun.',
    form: 'Reflective Lyric',
    dateOrLocation: 'Cape Solitude, Autumn Dawn',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 1800000,
    body: `The world is green before it learns to shine,
A quiet breath held in the spruce and pine;
No clock has spoken, nor the harbor bell,
The shadows keep what they will never tell.

Across the desk, a leaf of morning pale,
Soft as the drift of an unhurried sail;
We write in silence what the heart has heard:
The holy pause between each spoken word.

Let all the hurried hours wait behind,
Here in the calm cathedral of the mind;
The ink is set, the morning paper clear,
Peace is the only guest we welcome here.`
  },
  {
    id: 'quote-quiet-minds',
    type: 'quote',
    quote: 'In the gentle stillness of the early hour, before the world asks you who you are, remember that your peace is not a retreat—it is the foundation from which everything true is built.',
    maker: 'Marcus H. Aurelius',
    about: 'Found in the Margin Notes of the Winter Meditations, Leaf 42',
    year: '1888',
    category: 'Solitude & Purpose',
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 600000
  },
  {
    id: 'quote-books-ships',
    type: 'quote',
    quote: 'A book is a morning paper written for the centuries; you open its folded leaves, and the thoughts of long-sleeping minds breathe upon your face like dawn over quiet water.',
    maker: 'Silvia Thorn',
    about: 'Letters to a Young Reader in the Northern Isles',
    year: '1912',
    category: 'Literature & Books',
    createdAt: Date.now() - 20000000,
    updatedAt: Date.now() - 300000
  }
];
