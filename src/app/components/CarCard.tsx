import Link from "next/link";
export default function CarCard({ car }: { car: any }) {
  const isSold=car.status==="sold", isReserved=car.status==="reserved";
  return (
    <Link href={`/car/${car.id}`} className="car-card">
      <div className="car-card-img">
        {car.images?.[0] ? <img src={car.images[0]} alt={car.title} loading="lazy" /> : (<img src="https://ejohspmzhujmjnnnhtyj.supabase.co/storage/v1/object/public/cars/photos/images-1.png" alt="Photo à venir" style={{width:"100%",height:"100%",objectFit:"contain",background:"#111",padding:"16px"}} />)}
        {isReserved && (
            <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:2}}>
              <div style={{color:"#f59e0b",border:"2px solid #f59e0b",fontWeight:900,fontSize:"16px",letterSpacing:".14em",padding:"8px 24px",fontFamily:"var(--font-head)"}}>RÉSERVÉ</div>
            </div>
          )}
          {isSold && (
            <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:2}}>
              <div style={{color:"#888",border:"2px solid #888",fontWeight:900,fontSize:"16px",letterSpacing:".14em",padding:"8px 24px",fontFamily:"var(--font-head)"}}>VENDU</div>
            </div>
          )}
      </div>
      <div className="car-card-body">
        <p className="car-make">{car.fuel} · {car.gearbox}{car.color?` · ${car.color}`:""}</p>
        <p className="car-title">{car.title}</p>
        <p className="car-specs"><span>{car.year}</span>&nbsp;·&nbsp;<span>{car.km?.toLocaleString("fr-FR")} km</span>{car.power_din?<>&nbsp;·&nbsp;<span>{car.power_din} ch</span></>:null}</p>
        <div className="car-features">{(car.features??[]).slice(0,3).map((f:string)=><span key={f} className="car-feat">{f}</span>)}</div>
        <p className="car-price">{car.price?.toLocaleString("fr-FR")} € <span className="car-price-ttc">TTC</span></p>
      </div>
      <div className="car-card-footer">
        <div className="btn btn-accent btn-full" style={{fontSize:"12px",padding:"10px"}}>Voir ce véhicule →</div>
      </div>
    </Link>
  );
}
