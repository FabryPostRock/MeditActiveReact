import perspectiveWalls from '../assets/img/background_bordi_zen_fiori_di_loto.png';

export function PerspectiveWalls() {
  return (
    <div className="perspective-walls" aria-hidden="true">
      <img className="perspective-walls__image" src={perspectiveWalls} alt="" draggable={false} />
    </div>
  );
}
