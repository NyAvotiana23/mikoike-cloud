.PHONY: setup run test lint

setup:
	cd web-react && npm ci
	cd mobile-vue && npm ci

run:
	docker compose up dev --build

test:
	cd cloud-back && mvn -B test
	cd web-react && npm test
	cd mobile-vue && npm run test:unit -- --run

lint:
	cd web-react && npm run lint
	cd mobile-vue && npm run lint && npx vue-tsc --noEmit
