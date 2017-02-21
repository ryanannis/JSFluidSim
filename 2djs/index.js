const canvas = document.getElementById('display');
const ctx = canvas.getContext('2d');

const particles = [];

/* Simulation Constants */
const timestep = 1/30;
const solverIterations = 10;
const kernelSizeSquare = 0.1;
const particleMass = 1;

/* Physical constraints and constants */
const gravity = 9.81;
const bounds = [1.0, 1.0, 1.0]; // The dimensions of the container the fluid is bounded in.

const initialiseParticles = () => {

};

/* Use naive O(n) method for now.
   Returns a list of indcies for the neighbours of the particles at index. 
*/
const findNeighbours = (index) => {
    const pos = particles[index].pos;
    const results = [];

    for(let i = 0; i < particles.length; i++){
        /* Calculate eulerian distance */
        if(index === i) continue;
        const neighbourPos = particles[i].pos;
        if((pos.x -neighbourPos.x) * (pos.x -neighbourPos.x) + (pos.y -neighbourPos.y) * (pos.y -neighbourPos.y) < kernelSizeSquare){
            results.push(i);
        }
    }
    return results;
};

/* Returns the scaling coefficient for the Poly6 Kernel's 
 * (still need to provide unit vector) */
const poly6Kernel = (r, h) => {
    if( r >= 0 && r <= h ){
        return ( 315/(64 * pi * Math.pow(h,9)) * Math.pow(h*h - r*r, 3) );
    }
    return 0;
}

/* Returns the scaling coefficient for the Spiky Kernel's gradient
 * (still need to provide unit vector) */
const spikyKernelGradient = (p1, p2) => {
    const pos1 = particles[p1].newPos;
    const pos2 = particles[p2].newPos;

    const r = Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) - Math.pow(pos1[1] - pos2[1], 2));

    let scale = 0;

    if( r >= 0 && r <= h ){
       scale = -45 / (Math.pi * Math.pow(h,6)) * Math.pow(h - r, 2)/2 * 1/r;
    }

    return [scale * (pos2[0].x - pos1[0].x), scale * (pos2[1] - pos1[0])];
}

/* Returns the Norm of constaint function C1 with respect to particle P2 */
const spikyConstraintNorm = (p1,p2) => {
    let accumulator = 0;
    /* Sum over neighbours if p1=p2 */
    if(p1 === p2){
        const neighbours = particles[p1].neighbours;
        for(let i = 0; i < neighbours.length; i++){
            const gradient = spikyKernelGradient(p1, i);
            const squaredDist = gradient[0] * gradient[0] + gradient[1] * gradient[1] 
            accumulator += Math.sqrt(squaredDist);
        }
    } else {
        /* Else just return the gradient with respect to p2 */
        const gradient = spikyKernelGradient(p1, p2);
        const squaredDist = gradient[0] * gradient[0] + gradient[1] * gradient[1] 
        accumulator += Math.sqrt(squaredDist);
    }
    return accumulator;
}

const simulate = () => {
    for(let i = 0; i < particles.length; i++){
        /* Apply Forces to Particle, Just Gravity for Now */
        particles[i].vel += timeStep * gravity;
        particles[i].newPos += timestep * particles[i].v;
    }
    

    /* Find all neighbours of each particle*/
    for(let i = 0; i < particles.length; i++){
        particles[i].neighbours = findNeighbours(i);
    }

    /* Apply incompressibility solver to each particle*/
    for(let i = 0; i < solverIterations; i++){
        for(let j = 0; j < particles.length; j++){
            // Calculate Lambda
        }
       for(let j = 0; j < particles.length; j++){
           // Calculate Correction
       }
       for(let j = 0; j < particles.length; j++){
           // Apply Correctoin
       }
    }

    for(let i = 0; i < particles.length; i++){
        // Update velocity using verlet integration
        // Apply position update
    }
};

const render = () => {
    // For the basic CPU version, for each particle just draw a small circle
}

const tick = () => {

}
