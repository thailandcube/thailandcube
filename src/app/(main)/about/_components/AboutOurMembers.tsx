'use client';

import {
  Avatar,
  Card
} from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';

export interface StaffMember {
  id: string;
  wcaId: string;
  name_en: string;
  name_th: string;
  role_en: string;
  role_th: string;
  imageUrl: string;
}

export default function AboutOurMembers({ locale, staffData }: { locale: string, staffData: StaffMember[] }) {
  return (
    <div className='mt-5 mx-8 md:mx-24 mb-10'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {staffData.map((staff) => (
          <Card 
            key={staff.id} 
            className='w-full border border-default-200 bg-transparent shadow-none hover:bg-default-50 transition-colors'
          >
            <Card.Content className='flex flex-row items-center p-6 gap-6'>
              <Avatar className='w-24 h-24 shrink-0'>
                <Image alt={staff.name_en} width={96} height={96} src={staff.imageUrl}/>
              </Avatar>
              
              <div className='flex flex-col grow justify-center'>
                <p className='text-xl font-bold'>
                  {staff[`name_${locale}` as keyof StaffMember]}
                </p>
                <p className='text-sm text-primary font-semibold uppercase mt-1'>
                  {staff[`role_${locale}` as keyof StaffMember]}
                </p>
                
                <div className='mt-3 flex gap-2'>
                  <Link href={`https://www.worldcubeassociation.org/persons/${staff.wcaId}`} className='inline-flex items-center gap-1.5 px-2 py-1 bg-default-100 font-medium text-default-600 rounded-md text-md'>
                    <Image width={32} height={32} src='assets/img/wca.svg' alt='WCA Logo'/> WCA Profile
                  </Link>
                </div>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  );
}