import { Spherical, Vector3 } from 'three';
import gsap from "gsap"

/**
 * Lerp but orbit like. Therefore Spherical Coordinates is uses on this function
 * @param {import('three').Vector3} pos 
 * @param {import('three').Vector3} target 
 * @param {number} distance Arc distance widerness
 * @param {number} t 
 * @returns {import('three').Vector3}
 */
const spherical_lerp = (pos, target, distance, t) => {
  pos = pos.clone();
  target = target.clone();

  const rA = pos.length();
  const rB = target.length();
  const thetaA = Math.atan2(pos.z, pos.x);
  const thetaB = Math.atan2(target.z, target.x);
  const phiA = Math.acos(pos.y / rA)
  const phiB = Math.acos(target.y / rB)

  const r_lerp = gsap.utils.interpolate(rA, rB, t) + distance * Math.sin(Math.PI * t);
  const theta_lerp = gsap.utils.interpolate(thetaA, thetaB);
  const phi_lerp = gsap.utils.interpolate(phiA, phiB);

  const x = r_lerp * Math.sin(phi_lerp(t)) * Math.cos(theta_lerp(t));
  const y = r_lerp * Math.cos(phi_lerp(t));
  const z = r_lerp * Math.sin(phi_lerp(t)) * Math.sin(theta_lerp(t));

  return new Vector3(x, y, z)
}

export {
  spherical_lerp
}