interface ExerciseTitle {
  title: string;
}

export function Title({ title }: ExerciseTitle) {
  return (
    <div>
      <h2 className="fs-2 secondary-color text-start mb-3">{title}</h2>
      <div />
    </div>
  );
}
