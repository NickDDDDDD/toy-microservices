import { Container } from "./Container";

const EmptyDemo = () => {
  return (
    <Container id="empty-demo">
      <div className="aspect-[4/3] h-[50dvh] max-w-none rounded-4xl bg-neutral-800 p-4 text-neutral-200">
        Empty Demo
      </div>
    </Container>
  );
};

export default EmptyDemo;
