type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type Position = 'text-start' | 'text-center' | 'text-end';

interface ExerciseTitle {
  title: string;
  txtColor: string;
  headlineType: HeadingTag;
  position: Position;
  underlineOnHover: boolean;
  scaleOnHover: boolean;
}

// headlineType: Tag inside a destructuring means 'rename' it's not a type assignment
export function Title({ title, txtColor, headlineType: Tag, position, underlineOnHover }: ExerciseTitle) {
  return (
    <Tag className={`fw-bold fs-2 ${position} mb-3`} style={{ color: txtColor }}>
      {/*'width: fit-content' used for the animation pourposes disrupts the floating behaviour of the text content if used directly 
        in the h2 */}

      {underlineOnHover ? <span className="text-underline">{title}</span> : null}
    </Tag>
  );
}
