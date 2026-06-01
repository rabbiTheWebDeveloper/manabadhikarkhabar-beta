import React from 'react';

export default function Loading() {
  return (
    <div className="w-full animate-pulse bg-white min-h-screen">
      {/* Top Banner Ad Skeleton */}
      <div className="max-w-7xl mx-auto px-4 mt-3 hidden md:block">
        <div className="w-full h-[90px] bg-gray-200 rounded"></div>
      </div>

      {/* Main Content Area Skeleton */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8">
          
          {/* Left/Main Column (9 Cols) */}
          <div className="lg:col-span-9">
            
            {/* Lead Story Section Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 border-b border-gray-200 pb-4 sm:pb-6 mb-4 sm:mb-6">
              
              {/* Main Headline Skeleton */}
              <div className="md:col-span-8 pr-0 md:pr-4">
                 <div className="w-full aspect-[16/9] mb-4 bg-gray-200 rounded"></div>
                 <div className="h-8 sm:h-10 bg-gray-200 rounded w-full mb-3"></div>
                 <div className="h-8 sm:h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
                 
                 <div className="space-y-2 sm:space-y-3">
                   <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
                   <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
                   <div className="h-3 sm:h-4 bg-gray-200 rounded w-5/6"></div>
                 </div>
                 
                 {/* Printed/metadata bar Skeleton */}
                 <div className="h-10 bg-gray-100 rounded w-full mt-4 border border-gray-200"></div>
              </div>

              {/* Sub Headlines Next to Main Skeleton */}
              <div className="md:col-span-4 flex flex-col gap-6 md:border-l md:border-gray-200 md:pl-5">
                {[1, 2].map((i) => (
                  <div key={i} className={i > 1 ? 'border-t border-gray-200 pt-5' : ''}>
                    <div className="w-full aspect-[3/2] mb-3 bg-gray-200 rounded"></div>
                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-6 bg-gray-100 rounded w-full mt-3"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Grid for Secondary Stories Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 pb-4 sm:pb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col border-b border-gray-200 sm:border-b-0 sm:border-r last:sm:border-r-0 border-gray-200 pb-4 sm:pb-0 sm:pr-4 last:sm:pr-0">
                  <div className="w-full aspect-[3/2] mb-3 bg-gray-200 rounded"></div>
                  <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-5/6 mb-4"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                  <div className="mt-auto h-6 bg-gray-100 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar (3 Cols) Skeleton */}
          <aside className="lg:col-span-3 border-t lg:border-t-0 border-gray-200 pt-4 lg:pt-0 mt-2 lg:mt-0">
            {/* Tabs Block Skeleton */}
            <div className="border border-gray-300 rounded-sm overflow-hidden">
               <div className="flex h-[45px] bg-gray-100 border-b border-gray-300">
                 <div className="flex-1 border-r border-gray-300 bg-white"></div>
                 <div className="flex-1"></div>
               </div>
               
               <div className="p-4 flex flex-col pt-5 gap-5">
                 {[1, 2, 3, 4, 5].map((i) => (
                   <div key={i} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                     <div className="w-6 h-8 bg-gray-200 rounded shrink-0"></div>
                     <div className="flex-1 space-y-2">
                       <div className="h-4 bg-gray-200 rounded w-full"></div>
                       <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                       <div className="h-3 bg-gray-100 rounded w-1/3 mt-2"></div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Sidebar Tools/Ads Skeleton */}
            <div className="mt-6 md:mt-8 p-4 border border-gray-300 bg-gray-50/50">
               <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
               <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
               <div className="h-3 bg-gray-200 rounded w-4/5 mb-4"></div>
               <div className="space-y-3">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="flex gap-3">
                     <div className="w-12 h-12 bg-gray-200 rounded shrink-0"></div>
                     <div className="flex-1 space-y-2 py-1">
                       <div className="h-3 bg-gray-200 rounded w-full"></div>
                       <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="mt-6 md:mt-8 w-full aspect-[3/4] bg-gray-200 rounded"></div>
            <div className="mt-4 w-full aspect-[3/2] bg-gray-200 rounded"></div>
          </aside>
        </div>
        
        {/* Photo Gallery Section Skeleton */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-[3px] border-gray-300 pb-6 sm:pb-8">
           <div className="flex justify-between items-end mb-4 sm:mb-6">
             <div className="flex items-center gap-2">
               <div className="w-2 sm:w-3 h-8 sm:h-10 bg-gray-300"></div>
               <div className="h-8 sm:h-10 bg-gray-200 rounded w-32 sm:w-48"></div>
             </div>
             <div className="h-5 bg-gray-200 rounded w-24"></div>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="w-full aspect-square bg-gray-200 rounded"></div>
             ))}
           </div>
        </div>
      </main>
    </div>
  )
}