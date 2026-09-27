type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type Position = 'text-start' | 'text-center' | 'text-end';
type TextSizeClass =
  'fs-1' | 'fs-2' | 'fs-3' | 'fs-4' | 'fs-lg-1' | 'fs-lg-2' | 'fs-lg-3' | 'fs-lg-4' | 'fs-md-2' | 'fs-md-3' | 'fs-md-4';
// Allows combination of multiple classes
type TextSize = TextSizeClass[];

interface ExerciseTitle {
  title: string;
  txtColor: string;
  txtSize: TextSize;
  headlineType: HeadingTag;
  position: Position;
  underlineOnHover: boolean;
  underlineTxtFit: boolean;
  scaleOnHover: boolean;
}

// headlineType: Tag inside a destructuring means 'rename' it's not a type assignment
export function Title({
  title,
  txtColor,
  txtSize,
  headlineType: Tag,
  position,
  underlineOnHover,
  underlineTxtFit,
}: ExerciseTitle) {
  function renderTitleContent() {
    if (!underlineOnHover) {
      return title;
    }
    if (underlineOnHover && underlineTxtFit) {
      return <span className="text-underline-fit">{title}</span>;
    } else if (underlineOnHover && !underlineTxtFit) {
      return <span className="text-underline">{title}</span>;
    }
  }
  return (
    <Tag className={`fw-bold ${txtSize.join(' ')} ${position} mb-3`} style={{ color: txtColor }}>
      {/*'width: fit-content' used for the animation pourposes disrupts the floating behaviour of the text content if used directly 
        in the h2 */}
      {
        /**In JSX you can only return something you can't write js code directly with if and other statement */
        renderTitleContent()
      }
    </Tag>
  );
}
