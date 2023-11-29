import Link from "next/link";

export default function Home() {
  return (
    <div className="m-auto h-screen w-full flex items-center justify-center">
      <div className="h-fit w-fit flex flex-col gap-16 items-center">
        <h1 className='text-6xl font-semibold'>Contact</h1>
        <div className="h-fit w-full flex flex-col gap-5 items-center text-lg sm:text-xl md:text-2xl">
          <p className="">Mail: <Link href="mailto:esteban@ereynier.me" className="underline">esteban@ereynier.me</Link></p>
          <p className="">Linkedin: <Link href="https://linkedin.com/in/ereynier" target="_blank" className="underline">@ereynier</Link></p>
        </div>
      </div>
    </div>
  )
}
