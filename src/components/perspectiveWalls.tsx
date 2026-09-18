import perspectiveWalls from '../assets/img/bordi_zen_con_loto_e_yin_yang.svg';

export function PerspectiveWalls() {
  return (
    <div className="perspective-walls" aria-hidden="true">
      <img className="perspective-walls__image" src={perspectiveWalls} alt="" draggable={false} />
    </div>
  );
}
