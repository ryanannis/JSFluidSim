const stepper = document.getElementById('stepper');
const canvas = document.getElementById('display');
const ctx = canvas.getContext('2d');

const particles = [];

/* Simulation Constants */
const timestep = 1/30;
const solverIterations = 20;
const kernelSizeSquare = 0.1;
const particleMass = 1;
const h = 0.1;

/* Physical constraints and constants */
const gravity = -9.81;
const bounds = [1.0, 1.0]; //The fluid is bounded in a 1m^2 box

const initialiseParticles = () => {
    for(let i = 2; i < 20; i++){
        particles.push(
            {
                pos: [i / 20, 0.5],
                vel: [0, 0],
            }
        )
    }
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
const poly6Kernel = (p1, p2) => {
    const pos1 = particles[p1].newPos;
    const pos2 = particles[p2].newPos;

    const r = Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) - Math.pow(pos1[1] - pos2[1], 2));

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

    /* Adjust by particle mass (density, rho_0) */
    scale *= 1/particleMass;

    return [
        1/particleMass * scale * (pos1[0] - pos2[0]),
        1/particleMass * scale * (pos1[1] - pos2[1])
    ];
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
        particles[i].vel[1] += timeStep * gravity;

        /* Set estimate of particle update position */
        particles[i].newPos[0] = particles[i].pos[0] + timestep * particles[i].vel[0];
        particles[i].newPos[1] = particles[i].pos[1] + timestep * particles[i].vel[1];
    }

    /* Find all neighbours of each particle*/
    for(let i = 0; i < particles.length; i++){
        particles[i].neighbours = findNeighbours(i);
    }

    /* Apply incompressibility solver to each particle*/
    for(let i = 0; i < solverIterations; i++){

        /* Calculate lambda (scaling constant along gradient of constraint) for each particle*/
        const lambda = new Array(particles.length);
        for(let j = 0; j < particles.length; j++){
            const particle = particles[j];
            const neighbours = particle.neighbours;

            const norm = spikyConstraintNorm(j, j);
            let density = 0;

            /* Sum over particles to get density */
            for(let q = 0; q < neighbours.length; q++){
                density += particleMass * poly6Kernel(j, q);
            }

            const C = density/particleMass - 1;

            lambda[j] = C / norm;
        }

        const deltaP = new Array(particles.length);
        for(let j = 0; j < particles.length; j++){
            const particle = particles[j];
            const neighbours = particle.neighbours;

            let dp = [0, 0];
            /* Sum over neighbours corrections */
            for(let q = 0; q < neighbours.length; q++){
                const lambdaSum = lambda[j] + lambda[i];
                const deltaW = spikyKernelGradient(j, q);
                dp[0] += deltaW[0] * lambdaSum;
                dp[1] += deltaW[1] * lambdaSum;
            }
            dp[0] /= particleMass;
            dp[1] /= particleMass;

            /* Apply the correction */
            particle.newPos[0] != dp[0];
            particle.newPos[1] != dp[1];

            /* We are lazy for the 2d demo so just clamp the particles 
             * to the edge of the box */
            if(particle.newPos[0] > bounds[0]){
                particle.newPos = bounds[0];
            }
            if(particle.newPos[0] < -bounds[0]){
                particle.newPos = -bounds[0];
            }
            if(particle.newPos[1] > bounds[1]){
                particle.newPos = bounds[1];
            }
            if(particle.newPos[1] < -bounds[1]){
                particle.newPos = -bounds[1];
            }
        }
    }

    /* Apply position update and update velocity with Verlet integration */
    for(let i = 0; i < particles.length; i++){
        /* Apply correction to velocity */
        const particle = particles[i];
        particle.vel[0] += 1/timestep * (particle.newPos[0] - particle.pos[0]);
        particle.vel[1] += 1/timestep * (particle.newPos[1] - particle.pos[1]);

        particle.pos = particle.newPos;
    }
};

const render = () => {
    for(let i = 0; i < particles.length; i++){
        const particle = particles[i];
        ctx.beginPath();
        ctx.arc(particle.pos[0] * 500, particle.pos[1] * 500 ,10,0,2*Math.PI);
        ctx.stroke();
    }
}

stepper.onclick = () => {
    simulate();
    render();
}

/* Initial render*/
initialiseParticles();
render();
console.log('faggot');