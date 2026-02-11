<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import * as CANNON from 'cannon-es';

	export let diceType: 'd6' | 'd20' = 'd6';
	export let rolling = false;
	export let onRollComplete: (result: number) => void = () => {};

	let canvasContainer: HTMLDivElement;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let diceMesh: THREE.Mesh;
	let diceBody: CANNON.Body;
	let world: CANNON.World;
	let animationId: number;

	const diceTextures: Record<string, string[]> = {
		d6: ['1', '2', '3', '4', '5', '6'],
		d20: Array.from({ length: 20 }, (_, i) => (i + 1).toString())
	};

	function createDiceTexture(number: string, size = 256): THREE.CanvasTexture {
		const canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		const ctx = canvas.getContext('2d')!;

		// Background gradient
		const gradient = ctx.createLinearGradient(0, 0, size, size);
		gradient.addColorStop(0, '#1a1a2e');
		gradient.addColorStop(0.5, '#16213e');
		gradient.addColorStop(1, '#0f3460');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, size, size);

		// Border
		ctx.strokeStyle = '#e94560';
		ctx.lineWidth = 8;
		ctx.strokeRect(4, 4, size - 8, size - 8);

		// Number
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 120px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(number, size / 2, size / 2);

		// Glow effect
		ctx.shadowColor = '#e94560';
		ctx.shadowBlur = 20;
		ctx.strokeText(number, size / 2, size / 2);

		return new THREE.CanvasTexture(canvas);
	}

	function createDice() {
		const size = diceType === 'd6' ? 2 : 2.5;
		const geometry = diceType === 'd6'
			? new THREE.BoxGeometry(size, size, size)
			: new THREE.IcosahedronGeometry(size / 2);

		const materials = diceTextures[diceType].map((num) => {
			return new THREE.MeshStandardMaterial({
				map: createDiceTexture(num),
				metalness: 0.3,
				roughness: 0.4,
				envMapIntensity: 1
			});
		});

		diceMesh = new THREE.Mesh(geometry, materials);
		diceMesh.castShadow = true;
		diceMesh.receiveShadow = true;
		scene.add(diceMesh);

		// Physics body
		const shape = diceType === 'd6'
			? new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2))
			: new CANNON.Sphere(size / 2);

		diceBody = new CANNON.Body({
			mass: 1,
			shape: shape,
			position: new CANNON.Vec3(0, 5, 0),
			angularDamping: 0.5,
			linearDamping: 0.5
		});

		world.addBody(diceBody);
	}

	function rollDice() {
		if (rolling) return;
		rolling = true;

		// Reset position
		diceBody.position.set(0, 8, 0);
		diceBody.velocity.set(0, 0, 0);
		diceBody.angularVelocity.set(
			Math.random() * 10 - 5,
			Math.random() * 10 - 5,
			Math.random() * 10 - 5
		);
	}

	function getResult(): number {
		const up = new THREE.Vector3(0, 1, 0);
		const diceUp = new THREE.Vector3(0, 1, 0);
		diceUp.applyQuaternion(diceMesh.quaternion);

		if (diceType === 'd6') {
			const dot = up.dot(diceUp);
			if (dot > 0.9) return 1;
			if (dot < -0.9) return 6;
			// Simplified - in real implementation, check all faces
			return Math.floor(Math.random() * 6) + 1;
		}
		return Math.floor(Math.random() * 20) + 1;
	}

	function animate() {
		animationId = requestAnimationFrame(animate);

		world.step(1 / 60);

		diceMesh.position.copy(diceBody.position);
		diceMesh.quaternion.copy(diceBody.quaternion);

		// Check if dice has settled
		if (rolling && diceBody.velocity.length() < 0.1 && diceBody.position.y < 1) {
			rolling = false;
			const result = getResult();
			onRollComplete(result);
		}

		renderer.render(scene, camera);
	}

	function init() {
		// Scene
		scene = new THREE.Scene();
		scene.background = new THREE.Color(0x0a0a1a);

		// Camera
		camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
		camera.position.set(0, 5, 8);
		camera.lookAt(0, 0, 0);

		// Renderer
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(400, 400);
		renderer.shadowMap.enabled = true;
		canvasContainer.appendChild(renderer.domElement);

		// Lights
		const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
		scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(5, 10, 5);
		directionalLight.castShadow = true;
		scene.add(directionalLight);

		const pointLight = new THREE.PointLight(0xe94560, 1, 20);
		pointLight.position.set(-5, 5, 5);
		scene.add(pointLight);

		// Physics world
		world = new CANNON.World();
		world.gravity.set(0, -20, 0);
		world.broadphase = new CANNON.NaiveBroadphase();

		// Ground
		const groundShape = new CANNON.Plane();
		const groundBody = new CANNON.Body({ mass: 0 });
		groundBody.addShape(groundShape);
		groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
		world.addBody(groundBody);

		// Ground visual
		const groundGeometry = new THREE.PlaneGeometry(20, 20);
		const groundMaterial = new THREE.MeshStandardMaterial({
			color: 0x1a1a2e,
			metalness: 0.8,
			roughness: 0.2
		});
		const ground = new THREE.Mesh(groundGeometry, groundMaterial);
		ground.rotation.x = -Math.PI / 2;
		ground.receiveShadow = true;
		scene.add(ground);

		createDice();
		animate();
	}

	onMount(() => {
		init();
	});

	onDestroy(() => {
		cancelAnimationFrame(animationId);
		renderer.dispose();
	});
</script>

<div bind:this={canvasContainer} class="dice-container"></div>

<style>
	.dice-container {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.dice-container :global(canvas) {
		border-radius: 12px;
		box-shadow:
			0 0 30px rgba(233, 69, 96, 0.3),
			0 0 60px rgba(233, 69, 96, 0.1);
	}
</style>
