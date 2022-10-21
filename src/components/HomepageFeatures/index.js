import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";
const FeatureList = [
  {
    title: "資料科學",
    img: require("@site/static/img/python-logo.png").default,
    description: (
      <>
        <ul>
          <li>多維度SQL資料分析</li>
          <li>地理資訊分析</li>
          <li>機器學習與深度學習</li>
          <li>資料爬蟲</li>
        </ul>
      </>
    ),
  },
  {
    title: "前端工程",
    img: require("@site/static/img/js-logo.png").default,
    description: (
      <>
        <ul>
          <li>React.js</li>
          <li>Redux, Redux-thunk</li>
          <li>Node.js</li>
          <li>MongoDB</li>
        </ul>
      </>
    ),
  },
  {
    title: "人生與思考",
    img: require("@site/static/img/headspace.png").default,
    description: (
      <>
        <ul>
          <li>Mindfulness</li>
          <li>投資理財</li>
          <li>閱讀筆記</li>
        </ul>
      </>
    ),
  },
];

function Feature({ img, title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <img src={img} className="w-[100px]"></img>
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <div className="text--left">{description}</div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
