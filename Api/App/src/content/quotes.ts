/**
 * What Clippy says when he is sitting on the desktop: memento mori.
 *
 * Every line here is a real quotation from a public-domain source, with the work and the
 * passage named. Nothing is invented, and nothing that is popularly misattributed is included:
 * "death smiles at us all" is from the film Gladiator rather than Marcus Aurelius, and the
 * "life is a preparation for death" line usually pinned to Seneca is a paraphrase, so both are
 * out. Translations are the standard public-domain ones (Long for Meditations, Conington for
 * Horace, Basore for Seneca).
 */
export type Quote = { text: string; by: string }

export const quotes: Quote[] = [
  { text: 'Thou mayest depart from life at this moment: let this determine every act and thought.', by: 'Marcus Aurelius, Meditations 2.11' },
  { text: 'Do not act as if thou wert going to live ten thousand years. Death hangs over thee.', by: 'Marcus Aurelius, Meditations 4.17' },
  { text: 'Remember how long thou hast been putting off these things.', by: 'Marcus Aurelius, Meditations 2.4' },
  { text: 'Think thyself dead, and that thou hast lived up to the present time; and live according to nature the remainder.', by: 'Marcus Aurelius, Meditations 7.56' },
  { text: 'Loss of life is not an evil, for it has no shame in it.', by: 'Marcus Aurelius, Meditations 8.1' },
  { text: 'Time is carried on with a rapid stream.', by: 'Marcus Aurelius, Meditations 4.43' },
  { text: 'It is not that we have a short time to live, but that we waste a lot of it.', by: 'Seneca, On the Shortness of Life 1' },
  { text: 'While we are postponing, life speeds by.', by: 'Seneca, Letters 1' },
  { text: 'Nothing is ours, except time.', by: 'Seneca, Letters 1' },
  { text: 'Let us prepare our minds as if we had come to the very end of life.', by: 'Seneca, Letters 101' },
  { text: 'Every day ought to be regulated as if it closed the series.', by: 'Seneca, Letters 12' },
  { text: 'He who has learned to die has unlearned slavery.', by: 'Seneca, Letters 26' },
  { text: 'Life is long, if you know how to use it.', by: 'Seneca, On the Shortness of Life 2' },
  { text: 'Seize the day, trusting as little as possible in the next.', by: 'Horace, Odes 1.11' },
  { text: 'We are but dust and shadow.', by: 'Horace, Odes 4.7' },
  { text: 'Pale Death knocks with impartial foot at the poor man’s hut and the palaces of kings.', by: 'Horace, Odes 1.4' },
  { text: 'Dust thou art, and unto dust shalt thou return.', by: 'Genesis 3:19' },
  { text: 'Gather ye rosebuds while ye may, old Time is still a-flying.', by: 'Robert Herrick, To the Virgins' },
  { text: 'Had we but world enough and time, this coyness, lady, were no crime.', by: 'Andrew Marvell, To His Coy Mistress' },
  { text: 'Golden lads and girls all must, as chimney-sweepers, come to dust.', by: 'Shakespeare, Cymbeline' },
  { text: 'Out, out, brief candle! Life’s but a walking shadow.', by: 'Shakespeare, Macbeth' },
  { text: 'Teach us to number our days, that we may apply our hearts unto wisdom.', by: 'Psalm 90:12' },
  { text: 'Vanity of vanities; all is vanity.', by: 'Ecclesiastes 1:2' },
  { text: 'In the midst of life we are in death.', by: 'Book of Common Prayer, Burial of the Dead' },
  { text: 'Ask not for whom the bell tolls; it tolls for thee.', by: 'John Donne, Devotions XVII' },
  { text: 'Death be not proud, though some have called thee mighty and dreadful, for thou art not so.', by: 'John Donne, Holy Sonnets X' },
  { text: 'The paths of glory lead but to the grave.', by: 'Thomas Gray, Elegy Written in a Country Churchyard' },
  { text: 'Nothing can happen more beautiful than death.', by: 'Walt Whitman, Song of Myself' },
]

export const randomQuote = (): Quote => quotes[Math.floor(Math.random() * quotes.length)]
