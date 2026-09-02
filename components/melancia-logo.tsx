import Image from "next/image"

export function MelanciaLogo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className ?? ""}`}>
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-HTSZMT8QPV1m42HvaYs4ywHmXHudh1.png"
        alt="Melancia Foto e Presentes"
        width={80}
        height={80}
        className="size-14 rounded-md object-cover"
        priority
      />
    </span>
  )
}
