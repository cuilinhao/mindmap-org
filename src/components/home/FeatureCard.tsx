import React from 'react';
import styles from './FeatureCard.module.css';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: {
    en: string;
    zh: string;
  } | string;
  description: {
    en: string;
    zh: string;
  } | string;
  imageUrl?: string;
  language?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description, 
  imageUrl,
  language = 'en'
}) => {
  // Handle title based on whether it's a string or an object with language keys
  const displayTitle = typeof title === 'string' 
    ? title 
    : (language === 'zh' ? title.zh : title.en);
  
  // Handle description based on whether it's a string or an object with language keys
  const displayDescription = typeof description === 'string'
    ? description
    : (language === 'zh' ? description.zh : description.en);

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        {/* Back side - shown first */}
        <div className={styles.back}>
          <div className={styles["back-content"]}>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              {icon}
            </div>
            <p className="text-sm font-semibold text-white text-center px-2">{displayTitle}</p>
            <div className={styles.circle}></div>
            <div className={`${styles.circle} ${styles.bottom}`}></div>
            <div className={`${styles.circle} ${styles.right}`}></div>
          </div>
        </div>
        
        {/* Front side - shown after hover */}
        <div className={styles.front}>
          {imageUrl && <img className={styles.img} src={imageUrl} alt={displayTitle} />}
          <div className={styles["front-content"]}>
            <div className={styles.badge}>{displayTitle}</div>
            <div className={styles.description}>
              <div className={styles.title}>
                <p className="text-xs">{displayDescription}</p>
              </div>
              <div className={styles["card-footer"]}>
                {/* Optional footer content */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};