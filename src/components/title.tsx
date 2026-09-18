interface ExerciseTitle {
  title: string;
  txtColor: string;
}

export function Title({ title, txtColor }: ExerciseTitle) {
  return (
    <>
      <h2 className="fw-bold fs-2 text-start mb-3" style={{ color: txtColor }}>
        {title}
      </h2>
    </>
  );
}
