import styles from '../SchemaExplorer.module.scss';
import { Link } from 'react-router-dom';
import React from 'react';
import { GraphQLField } from 'graphql';
import { screenHistoryType } from 'types';

interface IScreenWithField {
  value: GraphQLField<string, string>;
  onClickType: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onClickBack: () => void;
  currentScreen: Array<screenHistoryType>;
}

function ScreenWithType(props: IScreenWithField) {
  const { value, currentScreen, onClickType, onClickBack } = props;

  return (
    <div className={styles.main_container}>
      {currentScreen.length > 2 && (
        <div className={styles.backMenu} onClick={onClickBack}>
          {'<' + currentScreen[currentScreen.length - 2]?.name}
        </div>
      )}
      <div className={styles.name}>{value.name}</div>
      {value.description && <div>{value.description}</div>}
      <div>
        Type:&nbsp;
        <Link className={styles.typeName} to="" onClick={(e) => onClickType(e)}>
          {value && 'type' in value && value.type.toString()}
        </Link>
      </div>
      {value && 'args' in value && !!value.args.length && (
        <div>
          <div>Arguments:</div>
          <span>
            {value.args.map((arg, argIndex) => (
              <div key={argIndex}>
                <span>
                  <span className={styles.argName}>{arg.name}</span>
                  :&nbsp;
                  <Link className={styles.typeName} to="" onClick={(e) => onClickType(e)}>
                    {arg.type.toString()}
                  </Link>
                </span>
              </div>
            ))}
          </span>
        </div>
      )}
    </div>
  );
}

export default ScreenWithType;
