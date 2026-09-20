import { test, expect } from "@playwright/test";

test.describe("Auth Suite (Register, Login, Role Guards)", () => {
  test("Register member baru berhasil", async ({ page }) => {
    const uniqueUsername = `member_${Date.now()}`;

    // Mock API register member
    await page.route("**/api/auth/register/member", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          message: "Pendaftaran member berhasil",
        }),
      });
    });

    await page.goto("/auth/Register");
    await page.fill("#nama_member", "Budi Santoso");
    await page.fill("#instansi", "SMK Telkom Malang");
    await page.fill("#telp", "081234567890");
    await page.fill("#alamat", "Jl. Danau Ranau");
    await page.fill("#username", uniqueUsername);
    await page.fill("#password", "password123");
    await page.fill("#confirmPassword", "password123");

    await page.click("#btn-register-member");

    // Redirect ke Login
    await expect(page).toHaveURL(/.*\/auth\/Login/);
  });

  test("Register member gagal jika username sudah terpakai", async ({ page }) => {
    await page.route("**/api/auth/register/member", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          status: false,
          message: "Username sudah terdaftar",
        }),
      });
    });

    await page.goto("/auth/Register");
    await page.fill("#nama_member", "Budi Santoso");
    await page.fill("#telp", "081234567890");
    await page.fill("#alamat", "Jl. Danau Ranau");
    await page.fill("#username", "existing_user");
    await page.fill("#password", "password123");
    await page.fill("#confirmPassword", "password123");

    await page.click("#btn-register-member");

    await expect(page.locator("#register-error-alert")).toContainText(
      "Username sudah terdaftar"
    );
  });

  test("Register admin space berhasil", async ({ page }) => {
    const uniqueAdmin = `admin_${Date.now()}`;

    await page.route("**/api/auth/register/admin-space", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          message: "Pendaftaran admin space berhasil",
        }),
      });
    });

    await page.goto("/auth/Register");
    await page.click("#tab-admin");

    await page.fill("#nama_coworking", "Malang Creative Hub");
    await page.fill("#nama_pemilik", "Ahmad Fauzi");
    await page.fill("#telp-admin", "089876543210");
    await page.fill("#username-admin", uniqueAdmin);
    await page.fill("#password-admin", "adminpass123");
    await page.fill("#confirmPassword-admin", "adminpass123");

    await page.click("#btn-register-admin");
    await expect(page).toHaveURL(/.*\/auth\/Login/);
  });

  test("Login sukses sebagai member mengarahkan ke katalog beranda", async ({
    page,
  }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          data: {
            role: "member",
            access_token: "fake-jwt-member-token",
            nama_member: "Member Uji",
          },
        }),
      });
    });

    await page.route("**/api/auth/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          data: {
            id: 1,
            role: "member",
            username: "member_test",
            nama: "Member Uji",
          },
        }),
      });
    });

    await page.goto("/auth/Login");
    await page.fill("#username", "member_test");
    await page.fill("#password", "password123");
    await page.click("#btn-login");

    await expect(page).toHaveURL(/\/$/);
  });

  test("Login sukses sebagai admin mengarahkan ke dashboard admin", async ({
    page,
  }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          data: {
            role: "admin_space",
            access_token: "fake-jwt-admin-token",
            nama_coworking: "Malang Space",
          },
        }),
      });
    });

    await page.route("**/api/auth/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          data: {
            id: 2,
            role: "admin_space",
            username: "admin_test",
            nama: "Admin Malang Space",
          },
        }),
      });
    });

    await page.goto("/auth/Login");
    await page.fill("#username", "admin_test");
    await page.fill("#password", "password123");
    await page.click("#btn-login");

    await expect(page).toHaveURL(/.*\/admin/);
  });

  test("Login gagal menampilkan pesan error dari API", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          status: false,
          message: "Username atau password salah.",
        }),
      });
    });

    await page.goto("/auth/Login");
    await page.fill("#username", "wrong_user");
    await page.fill("#password", "wrong_pass");
    await page.click("#btn-login");

    await expect(page.locator("#login-error-alert")).toContainText(
      "Username atau password salah."
    );
  });

  test("Akses halaman admin tanpa login ditolak dan diarahkan ke login", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/.*\/auth\/Login/);
  });
});
