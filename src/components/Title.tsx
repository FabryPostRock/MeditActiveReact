interface ExerciseTitle {
  title: string;
}

export default function Title({ title }: ExerciseTitle) {
  return (
    <div>
      <h4>{title}</h4>
      <div />
    </div>
  );
}
