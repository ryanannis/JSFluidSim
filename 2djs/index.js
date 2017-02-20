const canvas = document.getElementById('display');
const ctx = canvas.getContext('2d');

const particles = [];

/* Simulation Constants */
const timestep = 1/30;
const solverIterations = 10;
const kernelSizeSquare = 0.1;

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

const simulate = () => {
    for(let i = 0; i < particles.length; i++){
        /* Apply Forces to Particle, Just Gravity for Now */
        particles[i].v += timeStep * gravity;
        particles[i].xEst += timestep * particles[i].v;
    }
    

    for(let i = 0; i < particles.length; i++){
        particles[i].neighbours = findNeighbours(i);
    }

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
