import { test, expect, defineConfig } from '@playwright/test';

//Reutilizar login con usuario blockeado
test('Usuario bloqueado no puede entrar', async ({ page }) => {
await page.goto('https://www.saucedemo.com/');
await page.fill('#user-name', 'locked_out_user');
await page.fill('#password', 'secret_sauce');
await page.click('#login-button');
const errorMsg = page.locator('[data-test="error"]');
  // WebKit necesita esta línea:
  await expect(errorMsg).toBeVisible();
await expect(page.locator('[data-test="error"]'))
.toContainText('Sorry, this user has been locked out.');
});

//Hacer login en SauceDemo una sola vez y guardar el estado.

test('Set up login y guardar sesión', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await page.context().storageState({ path: 'state.json' });
  console.log('🔥 HACIENDO LOGIN...');
});

test ('Agregar producto al carrito', async ({ page }) => {
  await page.goto ('https://www.saucedemo.com/inventory.html');
  await page.click ('#add-to-cart-sauce-labs-bolt-t-shirt');
  const carrito = await page.locator('.shopping_cart_badge');
  await expect (carrito).toHaveText('1');
});

//Verificar que el producto agregado esté en el carrito
test ('Flujo completo', async ({ page }) => {
  await page.goto ('https://www.saucedemo.com/inventory.html');
  await page.click('#add-to-cart-sauce-labs-bolt-t-shirt');
  await page.click('#add-to-cart-sauce-labs-backpack');
  await page.click('.shopping_cart_link');
  const productoEnCarrito = await page.locator('.inventory_item_name');
  await expect (productoEnCarrito).toHaveCount(2);

// Continuar hacia el checkout
  await page.click('#checkout');
  await page.fill('#first-name', 'Juan');
  await page.fill('#last-name', 'Perez');
  await page.fill('#postal-code', '055422');
  await page.click('#continue');

 //Validar el total de los productos agregados

  const precios = page.locator('.inventory_item_price');
  const precio1 = await precios.nth(0).innerText();
  const precio2 = await precios.nth(1).innerText();

  //Convertir a números
  const valor1 = parseFloat(precio1.replace('$', ''));
  const valor2 = parseFloat(precio2.replace('$', ''));

  //Suma de los valores
   const totalCalculado = valor1 + valor2;
  console.log("Total calculado:", totalCalculado);

    // Tomar el total mostrado en la web
  const totalTexto = await page.locator('.summary_subtotal_label').innerText();
  const totalWebNumber = parseFloat(totalTexto.replace('Item total: $', ''));

  // Validar
  expect(totalCalculado).toBe(totalWebNumber);

  //Finalizar compra
  await page.click('#finish');

  const mensajeFinal = await page.locator('.complete-header').innerText();
  await expect(mensajeFinal).toContain('Thank you for your order!');

});

//Lo que se hizo fue agregar al carrito y verificar el producto si estuviera, luego eliminarlo.
//Remover producto del carrito para dejar el estado limpio
test ('Agregar producto al cart', async ({ page }) => {
  await page.goto ('https://www.saucedemo.com/inventory.html');
  await page.click ('#add-to-cart-sauce-labs-bolt-t-shirt');
  const carrito = await page.locator('.shopping_cart_badge');
  await expect (carrito).toHaveText('1');
});

//Verificar que el producto agregado esté en el carrito
test ('Redireccionar la carrito y verificar el producto', async ({ page }) => {
  await page.goto ('https://www.saucedemo.com/inventory.html');
  await page.click('#add-to-cart-sauce-labs-bolt-t-shirt');
  await page.click('.shopping_cart_link');
  const productoEnCarrito = await page.locator('.inventory_item_name');
  await expect (productoEnCarrito).toContainText ('Sauce Labs Bolt T-Shirt');

  //Remover el producto del carrito para dejar el estado limpio
  await page.click ('#remove-sauce-labs-bolt-t-shirt');
  const carritoVacio = await page.locator('.shopping_cart_badge');
    await expect (carritoVacio).toHaveCount(0); // Verifica que el carrito esté vacío
});


test.beforeEach(async ({ page }) => {
await page.goto('https://www.saucedemo.com/inventory.html');
if (await page.isVisible('#login-button')) {
await page.fill('#user-name', 'standard_user');
await page.fill('#password', 'secret_sauce');
await page.click('#login-button');
await page.context().storageState({ path: 'state.json' });
} else{
    console.log('✅ Sesión activa, no es necesario loguear.');
}
});