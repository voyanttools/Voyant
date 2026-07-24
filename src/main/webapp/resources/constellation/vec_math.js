
export function distance(source, target) {
    // This function returns the Euclidean distance between two arrays.
    return Math.sqrt(source.reduce((sum, current, index) => {
        const x = Math.pow(current - target[index], 2)
        return sum + x
    }, 0));
}

export function cosine_similarity(source, target) {
    // Take dot product of the two vectors.
    let dot_product = source.map((x, index) => {
        return x * target[index];
    }).reduce((x, y) => {
        return x + y
    }, 0);

    // Now get the magnitude of the source and target vectors
    let mag_source = Math.sqrt(source.map((x) => {
        return x * x;
    }).reduce((x, y) => {
        return x + y;
    }, 0));

    let mag_target = Math.sqrt(target.map((x) => {
        return x * x;
    }).reduce((x, y) => {
        return x + y;
    }, 0));

    // Now join everything together
    let similarity = dot_product / (mag_source * mag_target)

    // Similarity is a value between -1 and 1. Where 1 is the closest together.
    // To meaningfully use this in the graph we need to reverse this. So 1 is farther apart and -1 is close.
    // Then we will shift the distances to between 0 and 2 instead of -1 and 1.
    similarity = (similarity * -1) + 1
    return similarity
}

export function add(source, target) {
    if (source === null) {
        return target
    } else if (target === null) {
        return source
    }

    // Add two vectors together.
    return source.map((elem, index) => {
        return elem + target[index];
    })
}

export function subtract(source, target) {
    if (source === null) {
        return target
    } else if (target === null) {
        return source
    }

    // Subtracts the second vector from the first.
    return source.map((elem, index) => {
        return elem - target[index];
    })
}

export function* combinations(items) {
    // This function will return all pairs of values as an iterable.

    for (let row of items.entries()) {
        const index = row[0];
        const x = row[1];

        for (let y of items.slice(index + 1)) {
            yield [x, y]
        }
    }
}

export function get_from_array(term, nodes_data) {

    for (let row of nodes_data) {
        if (row.id === term || row.alt.includes(term)) {
            return row;
        }
    }

    return false
}
