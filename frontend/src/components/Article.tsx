// components/Article.tsx
import { Container } from "./Container";

const Article = () => {
  return (
    <Container id="article">
      <article className="prose prose-sm flex aspect-[4/3] h-[50dvh] max-w-none flex-col gap-4 overflow-auto rounded-4xl bg-neutral-800 p-8 text-neutral-200">
        <h1 className="text-center text-2xl font-bold">
          The Future of Human-AI Collaboration
        </h1>

        <p>
          In the 21st century, the rapid advancement of artificial intelligence
          has transformed industries and redefined human potential. No longer
          confined to science fiction, AI is now embedded in our daily lives —
          from smart assistants like Siri and Alexa, to AI-generated art and
          real-time language translation.
        </p>

        <p>
          One of the most promising applications of AI lies in human-AI
          collaboration. Rather than replacing humans, modern AI systems are
          designed to work alongside us, enhancing creativity, productivity, and
          decision-making. In medicine, AI supports doctors in diagnosing
          diseases with greater accuracy. In education, AI tutors personalize
          learning experiences for students of all levels.
        </p>

        <p>
          However, effective collaboration requires mutual understanding. As AI
          becomes more complex, researchers emphasize the importance of
          explainable AI (XAI) — systems that can justify their decisions in a
          way that humans can interpret and trust. This transparency builds
          confidence and enables smoother integration into workflows.
        </p>

        <p>
          Looking ahead, the challenge is not just technical, but ethical. How
          do we ensure AI systems are fair, unbiased, and aligned with human
          values? Collaboration must be guided by clear principles and inclusive
          design, ensuring the benefits of AI are distributed equitably across
          society.
        </p>
      </article>
    </Container>
  );
};

export default Article;
