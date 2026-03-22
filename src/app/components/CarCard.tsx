import Link from "next/link";
export default function CarCard({ car }: { car: any }) {
  const isSold=car.status==="sold", isReserved=car.status==="reserved";
  return (
    <Link href={isSold?"#":`/car/${car.id}`} className="car-card" style={isSold?{pointerEvents:"none",opacity:.5}:{}}>
      <div className="car-card-img">
        {car.images?.[0] ? <img src={car.images[0]} alt={car.title} loading="lazy" /> : (
          <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#1a1a1a",gap:"10px"}}>
            <svg width="64" height="40" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="14" width="56" height="20" rx="4" fill="#2a2a2a"/>
              <path d="M12 14 L18 4 L46 4 L52 14" fill="#2a2a2a" stroke="#333" strokeWidth="1"/>
              <circle cx="16" cy="34" r="6" fill="#333" stroke="#444" strokeWidth="1.5"/>
              <circle cx="48" cy="34" r="6" fill="#333" stroke="#444" strokeWidth="1.5"/>
              <rect x="22" y="7" width="10" height="7" rx="1.5" fill="#333"/>
              <rect x="34" y="7" width="10" height="7" rx="1.5" fill="#333"/>
            </svg>
            <span style={{fontSize:"11px",color:"#444",fontWeight:600,letterSpacing:".08em",textTransform:"uppercase"}}>Photo à venir</span>
          </div>
        )}
        <div className="car-badge-wrap">
          {isReserved && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
              <div style={{background:"rgba(245,158,11,.92)",color:"#000",fontWeight:900,fontSize:"16px",letterSpacing:".12em",padding:"10px 0",width:"140%",textAlign:"center",transform:"rotate(-35deg)",boxShadow:"0 2px 12px rgba(0,0,0,.4)"}}>RÉSERVÉ</div>
            </div>
          )}
          {isSold && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
              <div style={{background:"rgba(80,80,80,.92)",color:"#fff",fontWeight:900,fontSize:"16px",letterSpacing:".12em",padding:"10px 0",width:"140%",textAlign:"center",transform:"rotate(-35deg)",boxShadow:"0 2px 12px rgba(0,0,0,.4)"}}>VENDU</div>
            </div>
          )}
        </div>
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
