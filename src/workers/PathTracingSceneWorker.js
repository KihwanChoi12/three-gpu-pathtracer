import { ParallelMeshBVHWorker } from 'three-mesh-bvh/src/workers/ParallelMeshBVHWorker.js';
import { DynamicPathTracingSceneGenerator } from '../core/DynamicPathTracingSceneGenerator.js';
import { SAH } from 'three-mesh-bvh';

export class PathTracingSceneWorker {

	constructor() {

		this.bvhGenerator = new ParallelMeshBVHWorker();
		this.bvhGenerator.generateBVH = false;
		this.bvh = null;

	}

	generate( scene, options = {} ) {

		// ensure scene transforms are up to date
		// TODO: remove this?
		if ( Array.isArray( scene ) ) {

			scene.forEach( s => s.updateMatrixWorld( true ) );

		} else {

			scene.updateMatrixWorld( true );

		}

		const { bvhGenerator } = this;
		const sceneGenerator = new DynamicPathTracingSceneGenerator( scene );
		const results = sceneGenerator.generate();
		results.scene = scene;

		if ( ! this.bvh || results.objectsChanged ) {

			const bvhPromise = bvhGenerator.generate( results.geometry, {
				strategy: SAH,
				maxLeafTris: 1,
				indirect: true,
				...options,
			} );

			return bvhPromise.then( bvh => {

				results.bvh = bvh;
				this.bvh = bvh;

				return results;

			} );

		} else {

			this.bvh.refit();
			return results;

		}

	}

	dispose() {

		this.bvhGenerator.dispose();

	}

}
