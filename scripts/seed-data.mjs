import { drizzle } from "drizzle-orm/mysql2";
import { departments, positions, jobDuties } from "../drizzle/schema.ts";
import dotenv from "dotenv";

// 載入環境變數
dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function seedData() {
  console.log("開始初始化數據...");

  try {
    // 1. 創建部門
    console.log("\n1. 創建部門...");
    const departmentData = [
      { name: "總經理室", code: "GM", description: "總經理室" },
      { name: "北區業務部", code: "SN", description: "北區業務部門" },
      { name: "中區業務部", code: "SM", description: "中區業務部門" },
      { name: "南區業務部", code: "SS", description: "南區業務部門" },
      { name: "現代通路業務部", code: "SK", description: "現代通路業務部門" },
      { name: "外銷通路部", code: "SX", description: "外銷通路部門" },
      { name: "電商部", code: "SE", description: "電商部門" },
      { name: "企劃部", code: "M", description: "企劃部門" },
      { name: "採購部", code: "PR", description: "採購部門" },
      { name: "會計部", code: "F", description: "會計部門" },
      { name: "管理部", code: "A", description: "管理部門" },
      { name: "經營管理室", code: "O", description: "經營管理室" },
    ];

    const insertedDepts = [];
    for (const dept of departmentData) {
      const result = await db.insert(departments).values(dept);
      insertedDepts.push({ ...dept, id: Number(result[0].insertId) });
      console.log(`  ✓ 創建部門: ${dept.name} (${dept.code})`);
    }

    // 2. 創建職位 (以總經理室為例)
    console.log("\n2. 創建職位...");
    const gmDept = insertedDepts.find(d => d.code === "GM");
    
    const positionData = [
      {
        departmentId: gmDept.id,
        title: "總經理",
        level: "director",
        description: "總經理職位",
      },
      {
        departmentId: gmDept.id,
        title: "總經理室經理",
        level: "manager",
        description: "總經理室經理職位",
      },
    ];

    const insertedPositions = [];
    for (const pos of positionData) {
      const result = await db.insert(positions).values(pos);
      insertedPositions.push({ ...pos, id: Number(result[0].insertId) });
      console.log(`  ✓ 創建職位: ${pos.title}`);
    }

    // 3. 創建職掌 (以總經理室經理為例)
    console.log("\n3. 創建職掌...");
    const managerPos = insertedPositions.find(p => p.title === "總經理室經理");
    
    const jobDutyData = [
      {
        positionId: managerPos.id,
        code: "B1",
        title: "系統作業",
        description: "處理系統相關作業",
        category: "基礎作業",
        sortOrder: 1,
      },
      {
        positionId: managerPos.id,
        code: "B2",
        title: "促銷檔查審核",
        description: "審核促銷檔案",
        category: "基礎作業",
        sortOrder: 2,
      },
      {
        positionId: managerPos.id,
        code: "B3",
        title: "製作業績統計表",
        description: "製作業績統計表",
        category: "基礎作業",
        sortOrder: 3,
      },
      {
        positionId: managerPos.id,
        code: "D1",
        title: "解算稅務作業",
        description: "處理稅務相關作業",
        category: "財務作業",
        sortOrder: 4,
      },
      {
        positionId: managerPos.id,
        code: "P7",
        title: "人事作業1",
        description: "處理人事相關作業",
        category: "人事作業",
        sortOrder: 5,
      },
      {
        positionId: managerPos.id,
        code: "P8",
        title: "人事作業2",
        description: "處理人事相關作業",
        category: "人事作業",
        sortOrder: 6,
      },
      {
        positionId: managerPos.id,
        code: "P9",
        title: "人事作業3",
        description: "處理人事相關作業",
        category: "人事作業",
        sortOrder: 7,
      },
    ];

    for (const duty of jobDutyData) {
      await db.insert(jobDuties).values(duty);
      console.log(`  ✓ 創建職掌: ${duty.code} - ${duty.title}`);
    }

    console.log("\n✅ 數據初始化完成！");
    console.log("\n下一步:");
    console.log("1. 登入系統");
    console.log("2. 在系統設定中為其他部門創建職位和職掌");
    console.log("3. 為員工分配部門和職位");

  } catch (error) {
    console.error("❌ 數據初始化失敗:", error);
    throw error;
  }
}

// 執行初始化
seedData()
  .then(() => {
    console.log("\n程式執行完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n程式執行失敗:", error);
    process.exit(1);
  });
