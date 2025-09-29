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
function spherical_lerp(pos, target, distance, t) {
  pos = pos.clone();
  target = target.clone();

  let rA = pos.length();
  let rB = target.length();
  let thetaA = Math.atan2(pos.z, pos.x);
  let thetaB = Math.atan2(target.z, target.x);
  let phiA = Math.acos(pos.y / rA)
  let phiB = Math.acos(target.y / rB)

  let r_lerp = gsap.utils.interpolate(rA, rB);
  let theta_lerp = gsap.utils.interpolate(thetaA, thetaB);
  let phi_lerp = gsap.utils.interpolate(phiA, phiB);

  let x = (r_lerp(t) + distance * Math.sin(Math.PI * t)) * Math.sin(phi_lerp(t)) * Math.cos(theta_lerp(t));
  let y = (r_lerp(t) + distance * Math.sin(Math.PI * t)) * Math.cos(phi_lerp(t));
  let z = (r_lerp(t) + distance * Math.sin(Math.PI * t)) * Math.sin(phi_lerp(t)) * Math.sin(theta_lerp(t));

  return new Vector3(x, y, z)
}

export {
  spherical_lerp
}