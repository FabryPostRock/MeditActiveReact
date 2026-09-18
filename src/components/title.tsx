interface ExerciseTitle {
  title: string;
  txtColor: string;
}

export function Title({ title, txtColor }: ExerciseTitle) {
  return (
    <>
      <h2 className="fw-bold fs-2 text-start mb-3" style={{ color: txtColor }}>
        {/*'width: fit-content' disrupt the floating behaviour of the text content if used directly 
        in the h2 */}
        <span className="text-underline">{title}</span>
      </h2>
    </>
  );
}
