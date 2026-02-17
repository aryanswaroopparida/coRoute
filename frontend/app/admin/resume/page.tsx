import { Container } from "@/app/components/Container";
import { Heading } from "@/app/components/Heading";
import { Highlight } from "@/app/components/Highlight";
import { Paragraph } from "@/app/components/Paragraph";
import { WorkHistory } from "@/app/components/WorkHistory";

export default function Home() {
  return (
    <Container>
      <span className="text-4xl">💼</span>
      <Heading className="font-black">Work History</Heading>
      <Paragraph className="max-w-xl mt-4">
        I&apos;m a full-stack developer that loves{" "}
        <Highlight>building products</Highlight> and web apps that can impact
        millions of lives
      </Paragraph>
      <WorkHistory />
    </Container>
  );
}
