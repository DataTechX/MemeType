import { PermissionString } from 'discord.js';

/**
 * การกำหนดค่า อินเทอร์เฟซสำหรับ บอท.
 */
export interface IConfig {
    // โทเค็นของบอท 
    token: string;

    // คำนำหน้าของบอท
    prefix: string;

    // รหัสผู้พัฒนาของบอท 
    developers: string[];


    // สถานะของการส่งข้อความแสดงข้อผิดพลาดเมื่อผู้ใช้พยายามเรียกใช้คำสั่งที่ไม่รู้จัก

    unknownErrorMessage: boolean;
}


// อินเทอร์เฟซข้อมูลสำหรับคำสั่งทั้งหมด

export interface ICommandInfo {
    // ชื่อของคำสั่ง 
    name: string;

    // กลุ่มของคำสั่ง 
    group: string;

    // ชื่อยา่อของคำสั่ง 
    aliases?: string[];

    // ตัวอย่างการใช้งาน
    examples?: string[];

    // คำอธิบายของคำสั่ง 
    description?: string;

    /**
     * ระยะเวลารอการใช้งานแต่ละครั้ง (วินาที)
     *
     * นักพัฒนาจะไม่ได้รับผลกระทบ
     */
    cooldown?: number;

    // สถานะของคำสั่ง 
    enabled?: boolean;

    /**
     * หากเปิดใช้งาน คำสั่งจะทำงานในช่องทาง nsfw เท่านั้น
     *
     * นักพัฒนาจะไม่ได้รับผลกระทบ
     */
    onlyNsfw?: boolean;

    // ความต้องการของคำสั่ง 
    require?: ICommandRequire;
}


// อินเทอร์เฟซความต้องการสำหรับคำสั่ง

export interface ICommandRequire {
    // หากเปิดใช้งาน คำสั่งต้องได้รับอนุญาตจากนักพัฒนาจึงจะเรียกใช้
    developer?: boolean;

    /**
     * คำสั่งต้องมีแฟล็กการอนุญาตจึงจะรันได้
     *
     * นักพัฒนาจะไม่ได้รับผลกระทบ
     */
    permissions?: PermissionString[];
}
