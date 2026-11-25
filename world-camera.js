// Z-up authoring coordinates converted once into Three.js Y-up metres.
export const cameraStops = [
 [0,[1.4,10.3,9.5],[-1.3,6.8,8.8]],
 [.055,[.9,8.3,9.45],[-1.2,5.5,8.8]],
 [.11,[.35,3.5,9.55],[0,-18,6]],
 [.18,[0,-4,10],[0,-24,3.7]],
 [.31,[1,-17,6.4],[2,-33,3.2]],
 [.43,[2.7,-28,5.5],[4,-43,3]],
 [.55,[3,-39,5.3],[1,-51,3]],
 [.65,[6,-48,5.4],[-2,-55,1.6]],
 [.76,[6,-59,4.2],[-1,-53,2.5]],
 [.87,[14,-73,15],[0,-37,4]],
 [1,[19,-88,26],[0,-35,4]]
];
export function cameraPose(progress) {
 const t = Math.min(1,Math.max(0,progress));
 const index = Math.min(cameraStops.length-2, cameraStops.findIndex((stop,i)=>i<cameraStops.length-1&&t<=cameraStops[i+1][0]));
 const a=cameraStops[index], b=cameraStops[index+1];
 const dt=b[0]-a[0], u=(t-a[0])/dt;
 const slope=(k,key,axis)=>k===0||k===cameraStops.length-1 ? 0 :
   (cameraStops[k+1][key][axis]-cameraStops[k-1][key][axis])/(cameraStops[k+1][0]-cameraStops[k-1][0]);
 const interpolate=key=>a[key].map((value,axis)=>
   (2*u**3-3*u*u+1)*value+(u**3-2*u*u+u)*dt*slope(index,key,axis)+
   (-2*u**3+3*u*u)*b[key][axis]+(u**3-u*u)*dt*slope(index+1,key,axis));
 const convert=point=>[point[0],point[2],-point[1]];
 return {position:convert(interpolate(1)),target:convert(interpolate(2))};
}
