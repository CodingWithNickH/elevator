document.addEventListener('DOMContentLoaded', function() {

    const numOfFloors = 10;
    const numOfElevators = 3;
    const travelTime = 1000;

    const elevators = [];

    for (let i = 0; i < numOfElevators; i++) {
        elevators.push({
            id: i + 1,
            currentFloor: 1,
            destinationQueue: [],
            direction: 'idle',
            status: 'idle',
            element: document.querySelector(`.elevator-buttons-grid.el${i + 1}`)
        });
    }

    const floors = document.querySelectorAll('.floor');

    floors.forEach((floor, index) => {
        const floorNum = index + 1;
        const upButton = floor.querySelector('.up');
        const downButton = floor.querySelector('.down');

        upButton.addEventListener('click', () => elvCall(floorNum, 'up'));
        downButton.addEventListener('click', () => elvCall(floorNum, 'down'));

        if (floorNum === numOfFloors) {
            upButton.disabled = true;
        }
        if (floorNum === 1) {
            downButton.disabled = true;
        }
    });

    elevators.forEach(elevator => {
        const buttons = elevator.element.querySelectorAll('.elevator-button');
        buttons.forEach((button,index) => {
            const floorNum = index + 1;
            button.addEventListener('click', () => {
                if (elevator.currentFloor !== floorNum) {
                    requestFloor(elevator.id, floorNum);
                }
            });
        })
    });


    const elvCall = (floorNum, direction) => {
        console.log(`elvCall: ${direction} button pressed on floor ${floorNum}`);

        const bestElv = findElv(floorNum, direction);

        if (bestElv) {
            console.log(`Elevator ${bestElv.id} recieved ${direction} call from floor ${floorNum}`);
            addToQueue(bestElv, floorNum);
        }
    };

    const findElv = (floorNum, direction) => {
        let bestElv = null
        let shortestDistance = Infinity;

        elevators.forEach(elevator => {
            let distance = Math.abs(elevator.currentFloor - floorNum);

            elevator.status === 'idle' && distance < shortestDistance ? (bestElv = elevator, shortestDistance = distance) :
                (elevator.direction && direction) === 'up' && elevator.currentFloor < floorNum && distance < shortestDistance ? (bestElv = elevator, shortestDistance = distance) :
                (elevator.direction && direction) === 'down' && elevator.currentFloor > floorNum && distance < shortestDistance ? (bestElv = elevator, shortestDistance = distance) : null;

        });

        if (!bestElv) {
            elevators.forEach(elevator => {
                let distance = Math.abs(elevator.currentFloor - floorNum);
                elevator.status === 'idle' && distance < shortestDistance ? (bestElv = elevator, shortestDistance = distance) : null;
            });
        }
        return bestElv;
    }

    const addToQueue = (elevator, floorNum) => {
        elevator.destinationQueue.includes(floorNum) || elevator.currentFloor === floorNum ? null : elevator.destinationQueue.push(floorNum);
        console.log(`Elevator ${elevator.id} added floor ${floorNum} to queue`);

        elevator.status === 'idle' ? moveElevator(elevator) : null;
    };

    const moveElevator = (elevator) => {
        if (elevator.destinationQueue.length === 0) {
            elevator.status = 'idle';
            elevator.direction = 'idle';
            console.log(`Elevator ${elevator.id}: Now idle at floor ${elevator.currentFloor}`);
            return;
        }
        elevator.status = 'moving';

        elevator.destinationQueue.sort((a, b) => {
            if (elevator.currentFloor === 1) {
                return a - b;
            } else if (elevator.currentFloor === numOfFloors) {
                return b - a;
            } else {
                return Math.abs(elevator.currentFloor - a) - Math.abs(elevator.currentFloor - b);
            }
        });

        const nextFloor = elevator.destinationQueue[0];
        elevator.direction = nextFloor > elevator.currentFloor ? 'up' : 'down';

        console.log(`Elevator ${elevator.id} moving ${elevator.direction} to floor ${nextFloor}`);

        const floorsToMove = Math.abs(elevator.currentFloor - nextFloor);
        const timeToMove = floorsToMove * travelTime;

        setTimeout(() => {
            elevator.currentFloor = nextFloor;
            elevator.destinationQueue.shift();
            elevator.status = 'doors open';

            console.log(`Elevator ${elevator.id} arrived at floor ${nextFloor}, doors opening`);

            setTimeout(() => {
                elevator.status = 'doors closed';
                console.log(`Elevator ${elevator.id} doors closed`);
                moveElevator(elevator);
            }, 2000);
        }, timeToMove);

    };

    const requestFloor = (elevatorId, floorNum) => {
        const elevator = elevators[elevatorId - 1];
        console.log(`Elevator ${elevatorId}: Button for floor ${floorNum} pressed`);
        
        addToQueue(elevator, floorNum);
    };


})