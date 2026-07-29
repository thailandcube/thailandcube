import AboutContent from './_components/AboutContent';
import { StaffMember } from './_components/AboutOurMembers';

const staffData = [
  {
    id: '1',
    wcaId: '2009CHAI01',
    name_en: 'Tanai Chaikraveephand',
    name_th: 'ธนัย ชัยกระวีพันธ์',
    role_en: 'President (WCA Delegate)',
    role_th: 'ประธานชมรมฯ และผู้แทนสมาคมลูกบาศก์โลก',
  },
  {
    id: '2',
    wcaId: '2009KONV01',
    name_en: 'Asia Konvittayayotin',
    name_th: 'เอเชีย กรวิทยโยธิน',
    role_en: 'Main Coordinator',
    role_th: 'ฝ่ายประสานงาน',
  },
  {
    id: '3',
    wcaId: '2009SUPC01',
    name_en: 'Anukun Supcharoenkun',
    name_th: 'อนุกูล ทรัพย์เจริญกุล',
    role_en: 'Human Resources and Finance',
    role_th: 'ฝ่ายบริหารบุคคลและการเงิน',
  },
  {
    id: '4',
    wcaId: '2018PRON02',
    name_en: 'Phakinthorn Pronmongkolsuk',
    name_th: 'ภคินธร พรมงคลสุข',
    role_en: 'Information Technology and Technical Operations',
    role_th: 'ฝ่ายเทคโนโลยีสารสนเทศและงานเทคนิค',
  },
  {
    id: '5',
    wcaId: '2023RUNG01',
    name_en: 'Phumiphat Rungvichaniwat',
    name_th: 'ภูมิพัฒน์ รุ่งวิชานิวัฒน์',
    role_en: 'Communications and Public Relations (WCT Member)',
    role_th: 'ฝ่ายประชาสัมพันธ์และสื่อสารองค์กร (สมาชิก WCT)',
  },
];

export default async function AboutPage() {
  const staffWithAvatars = await Promise.all(
    staffData.map(async (staff) => {
      try {
        const res = await fetch(`https://www.worldcubeassociation.org/api/v0/persons/${staff.wcaId}`, {
          next: { revalidate: 86400 }
        });
        if (res.ok) {
          const data = await res.json();
          return { ...staff, imageUrl: data.person.avatar.url };
        }
      } 
      catch (err) {
        console.error(`Failed to fetch avatar for ${staff.wcaId}`);
      }
      return staff;
    })
  );

  return (
    <AboutContent staffData={staffWithAvatars as StaffMember[]}/>
  );
}